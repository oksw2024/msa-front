import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    initializeKakaoMap,
    clearKakaoMap,
    addUserMarker,
    addLibraryMarkers,
    getLibraries,
    checkBookExist,
    moveToLibrary,
    calculateDistance,
} from '../services/BookDetailService';
import { getFavorites, addFavorite, removeFavorite } from '../services/FavoriteService.js'
import '../css/BookDetailComponent.css';

const BookDetailComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookDetails = location.state?.bookDetails;

    const [libraries, setLibraries] = useState([]);
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);
    const [userCoords, setUserCoords] = useState(null);
    const [isUserCoordsReady, setIsUserCoordsReady] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3); //도서관 리스트 표시 개수
    const [isFavorite, setIsFavorite] = useState(false); //즐겨찾기

    // 서버에서 초기 즐겨찾기 상태 가져오기
    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const favorites = await getFavorites('accessToken'); // 적절한 토큰 전달
                const isFavorited = favorites.some((fav) => fav.bookIsbn === bookDetails?.isbn13);
                setIsFavorite(isFavorited);
            } catch (error) {
                console.error('Failed to fetch favorite status:', error);
            }
        };
        if (bookDetails?.isbn13) {
            fetchFavoriteStatus();
        }
    }, [bookDetails]);

    // 즐겨찾기 상태 변경
    const toggleFavorite = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            if (isFavorite) {
                await removeFavorite(bookDetails.isbn13);
            } else {
                await addFavorite(bookDetails); // 책 상세 정보를 전달
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Failed to update favorite status:', error);
            alert('즐겨찾기 상태를 변경할 수 없습니다.');
        }
    };

    ///이하 기존 기능, 변경 없음

    // 지도 초기화
    useEffect(() => {
        const initializeMap = () => {

            const mapObj = initializeKakaoMap('map', setError);

            if (mapObj) {
                setMap(mapObj);

                // 확대/축소 컨트롤이 중복 추가되지 않도록 관리
                if (!mapObj.zoomControlAdded) {
                    const zoomControl = new kakao.maps.ZoomControl();
                    mapObj.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                    mapObj.zoomControlAdded = true; // 커스텀 속성 추가
                }

                // 확대/축소 이벤트 등록
                kakao.maps.event.addListener(mapObj, 'zoom_changed', () => {
                    const zoomLevel = mapObj.getLevel();
                    const center = mapObj.getCenter();
                    console.log(`Zoom level changed to: ${zoomLevel}`);

                    // 지도 삭제 후 재생성
                    clearKakaoMap('map');
                    const newMapObj = initializeKakaoMap('map', (error) => console.error(error), {
                        center: center, // 기존 중심 좌표 유지
                        level: zoomLevel, // 기존 줌 레벨 유지
                    });

                    if (newMapObj) {
                        setMap(newMapObj);

                        // 확대/축소 컨트롤이 중복 추가되지 않도록 관리
                        if (!newMapObj.zoomControlAdded) {
                            const zoomControl = new kakao.maps.ZoomControl();
                            newMapObj.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
                            newMapObj.zoomControlAdded = true; // 커스텀 속성 추가
                        }
                    }
                });
            }
        };

        const scriptExists = !!window.kakao;

        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=ce20020febdbc7fbd8fbedaf35eeb4e8&libraries=services`;
            script.async = true;
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }
    }, []);

    // 현재 위치 마커 추가
    useEffect(() => {
        if (map) {
            addUserMarker(map, setError);
        }
    }, [map]);

// 사용자 위치 가져오기
    useEffect(() => {
        const fetchUserLocation = async () => {
            if (!navigator.geolocation) {
                setError('사용자 위치 서비스가 지원되지 않습니다.');
                setIsUserCoordsReady(true); // 위치가 없어도 로직 진행 가능
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoords({ latitude, longitude });
                    setIsUserCoordsReady(true); // 위치 정보를 성공적으로 가져옴
                    // 기존 맵 초기화
                    clearKakaoMap('map');

                    // 새로운 맵 초기화
                    const mapObj = initializeKakaoMap('map', setError, {
                        center: new kakao.maps.LatLng(latitude, longitude),
                        level: 4, // 적절한 줌 레벨 설정
                    });

                    if (mapObj) {
                        setMap(mapObj);

                        // 확대/축소 컨트롤 추가
                        const zoomControl = new kakao.maps.ZoomControl();
                        mapObj.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

                        // 사용자 위치 마커 추가
                        addUserMarker(mapObj, setError);
                    }
                },
                () => {
                    setError('사용자 위치를 가져올 수 없습니다.');
                    setIsUserCoordsReady(true); // 오류 시에도 로직 진행 가능
                }
            );
        };

        fetchUserLocation();
    }, []);

// 도서관 리스트 가져오기 및 거리 계산
    useEffect(() => {
        const fetchLibraries = async () => {
            if (!bookDetails?.isbn13 || !isUserCoordsReady) return;

            try {
                const libs = await getLibraries(bookDetails.isbn13);

                if (userCoords) {
                    const updatedLibraries = libs.map((lib) => {
                        if (lib.latitude && lib.longitude) {
                            lib.distance = calculateDistance(
                                parseFloat(userCoords.latitude),
                                parseFloat(userCoords.longitude),
                                parseFloat(lib.latitude),
                                parseFloat(lib.longitude)
                            );
                        } else {
                            lib.distance = Number.MAX_SAFE_INTEGER;
                        }
                        lib.loanStatus = null; // 초기 상태
                        lib.checked = false; // 대출 상태 확인 여부
                        return lib;
                    });

                    updatedLibraries.sort((a, b) => a.distance - b.distance);
                    setLibraries(updatedLibraries);
                } else {
                    const updatedLibraries = libs.map((lib) => ({
                        ...lib,
                        distance: null,
                        loanStatus: null,
                        checked: false,
                    }));
                    setLibraries(updatedLibraries);
                }
            } catch (err) {
                console.error('Error fetching libraries:', err);
                setError('도서관 정보를 가져오는 중 오류가 발생했습니다.');
            }
        };

        fetchLibraries();
    }, [bookDetails?.isbn13, isUserCoordsReady]);


    // 도서관 마커 추가
    useEffect(() => {
        if (map && libraries.length > 0) {
            addLibraryMarkers(map, libraries); // handleCheckExist 전달
        }
    }, [map, libraries]);



    // 대출 상태 확인
    const fetchLoanStatuses = async (start, end) => {
        const updatedLibraries = [...libraries];

        const toCheck = updatedLibraries.slice(start, end).filter((lib) => !lib.checked);

        for (const lib of toCheck) {
            try {
                const response = await checkBookExist(bookDetails.isbn13, lib.libCode);
                lib.loanStatus =
                    response.loanAvailable === "Y" ? '현재 대출 가능' : '현재 대출 불가';
                lib.checked = true; // 상태 확인 완료
            } catch {
                lib.loanStatus = '도서 상태 확인 불가';
                lib.checked = true; // 상태 확인 완료
            }
        }

        setLibraries(updatedLibraries);
    };


    useEffect(() => {
        if (libraries.length > 0) {
            fetchLoanStatuses(0, visibleCount);
        }
    }, [libraries.length, visibleCount]);

    const handleShowMore = () => {
        const previousCount = visibleCount;
        setVisibleCount((prev) => prev + 3); // 3개씩 추가 표시

        fetchLoanStatuses(previousCount, previousCount + 3); // 새로 보이는 도서관만 상태 확인
    };

    if (!bookDetails) {
        return (
            <div className="book-details-page">
                <h2>서적 정보가 존재하지 않습니다.</h2>
                <a onClick={() => navigate(-1)} className="detail-back-button">뒤로가기</a>
            </div>
        );
    }

    return (
        <div className="book-details-page">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault(); // 기본 동작 방지
                    navigate(-1); // 뒤로가기 기능
                }}
                className="detail-back-button"
            >뒤로가기
            </a>
            <div className="book-detail-content">
                <img src={bookDetails.bookImageURL} alt={bookDetails.bookname} className="book-detail-image"/>
                <div className="book-details-info">
                    <h1>{bookDetails.bookname}
                        <span
                            onClick={toggleFavorite}
                            style={{
                                cursor: 'pointer',
                                color: isFavorite ? 'gold' : 'gray',
                                marginLeft: '15px',
                                fontSize: '24px',
                            }}
                        >
                            {isFavorite ? '★' : '☆'}
                        </span>
                    </h1>
                    <p><strong>저자명:</strong> {bookDetails.authors.replace(/;/g, ' | ')}</p>
                    <p><strong>출판사:</strong> {bookDetails.publisher}</p>
                    <p><strong>출판연도:</strong> {bookDetails.publication_year}</p>
                    <p><strong>ISBN:</strong> {bookDetails.isbn13}</p>
                </div>
            </div>
            <h4><span style={{color: '#3f7aaa'}}>{bookDetails.bookname}</span> 소장 도서관</h4>
            <div id="map" style={{width: '100%', height: '400px', margin: '5px 0'}}></div>

            {error && <p className="error">{error}</p>}
            {libraries.length > 0 ? (
                <ul className="library-list">
                    {libraries.slice(0, visibleCount).map((library, index) => ( // 처음 visibleCount만큼만 표시
                        <li key={index} className="library-item" style={{cursor: 'default'}}>
                            <h3 className="library-name" style={{cursor: 'default'}}>
                                <span
                                    onClick={() => {
                                        moveToLibrary(map, library.latitude, library.longitude);
                                        document.getElementById('map')?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'center',
                                        });
                                    }}
                                    style={{cursor: 'pointer'}}
                                >
                                    {library.libName}
                                </span>
                            </h3>

                            <p>주소: {library.address}</p>
                            <p>운영 시간: {library.operatingTime || '운영 시간 정보 없음'}</p>
                            {library.distance !== null && (
                                <p>
                                    거리:{" "}
                                    {library.distance >= 1000
                                        ? `${(library.distance / 1000).toFixed(1)}km`
                                        : `${Math.round(library.distance)}m`}
                                </p>
                            )}
                            <p>전화번호: {library.tel || '전화번호 정보 없음'}</p>
                            <p className="loan-status">
                                {library.loanStatus === '현재 대출 가능' ? (
                                    <span style={{color: 'green'}}>{library.loanStatus}</span>
                                ) : library.loanStatus === '현재 대출 불가' ? (
                                    <span style={{color: 'red'}}>{library.loanStatus}</span>
                                ) : (
                                    <span>{library.loanStatus || '대출 상태 확인 중...'}</span>
                                )}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No library information available.</p>
            )}
            {visibleCount < libraries.length && (
                <button className="show-more-button"
                        onClick={handleShowMore}
                        style={{width: '100%'}}>
                    더보기
                </button>
            )}
        </div>
    );
};

export default BookDetailComponent;
