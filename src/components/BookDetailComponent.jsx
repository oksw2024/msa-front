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
    const [visibleCount, setVisibleCount] = useState(5); //도서관 리스트 표시 개수


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
            if (!bookDetails?.isbn13 || !isUserCoordsReady) {
                //console.warn('사용자 위치 또는 도서 정보가 준비되지 않았습니다.');
                return;
            }

            try {
                const libs = await getLibraries(bookDetails.isbn13);

                if (userCoords) {
                    // 거리 계산 및 정렬
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
                        return lib;
                    });

                    updatedLibraries.sort((a, b) => a.distance - b.distance);
                    setLibraries(updatedLibraries);
                } else {
                    // 거리 없이 도서관 리스트 설정
                    setLibraries(libs.map((lib) => ({ ...lib, distance: null })));
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

    const handleCheckExist = async (libCode, index) => {

        if (!bookDetails?.isbn13 || !libCode) {
            setError('도서 또는 도서관 정보가 올바르지 않습니다.');
            return;
        }

        try {
            const response = await checkBookExist(bookDetails.isbn13, libCode);

            const updatedLibraries = [...libraries];
            // API 응답에 따라 상태 업데이트
            updatedLibraries[index].loanStatus = response.loanAvailable === "Y" ? '현재 대출 가능' : '현재 대출 불가';
            updatedLibraries[index].buttonVisible = false;
            setLibraries(updatedLibraries);
        } catch {
            alert('도서 보유 여부를 확인할 수 없습니다.');
        }
    };

    const handleShowMore = () => {
        setVisibleCount((prev) => prev + 5); // 5개씩 추가로 표시
    };

    if (!bookDetails) {
        return (
            <div className="book-details-page">
                <h2>서적 정보가 존재하지 않습니다.</h2>
                <button onClick={() => navigate(-1)} className="back-button">뒤로가기</button>
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
                className="back-button"
            >뒤로가기
            </a>
            <div className="book-detail-content">
                <img src={bookDetails.bookImageURL} alt={bookDetails.bookname} className="book-detail-image"/>
                <div className="book-details-info">
                    <h1>{bookDetails.bookname}</h1>
                    <p><strong>저자명:</strong> {bookDetails.authors.replace(/;/g, ' | ')}</p>
                    <p><strong>출판사:</strong> {bookDetails.publisher}</p>
                    <p><strong>출판연도:</strong> {bookDetails.publication_year}</p>
                    <p><strong>ISBN:</strong> {bookDetails.isbn13}</p>
                </div>
            </div>
            <h3><span style={{color: '#3f7aaa'}}>{bookDetails.bookname}</span> 소장 도서관</h3>
            <div id="map" style={{width: '100%', height: '400px', margin: '5px 0'}}></div>

            {error && <p className="error">{error}</p>}
            {libraries.length > 0 ? (
                <ul className="library-list">
                    {libraries.slice(0, visibleCount).map((library, index) => ( // 처음 visibleCount만큼만 표시
                        <li key={index} className="library-item">
                            <h3
                                className="library-name"
                                onClick={() => {
                                    moveToLibrary(map, library.latitude, library.longitude);
                                    document.getElementById('map')?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start'
                                    });
                                }}
                                style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                            >
                                {library.libName}
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
                            {/*{library.homepage && (*/}
                            {/*    <a href={library.homepage} target="_blank" rel="noopener noreferrer" className="library-link">홈페이지</a>*/}
                            {/*)}*/}
                            {/*홈페이지 넣을까 말까 고민...*/}

                            {/* 대출 상태 표시 */}
                            {library.buttonVisible !== false ? (
                                <button
                                    className="check-exist-button"
                                    onClick={() => handleCheckExist(library.libCode, index)}
                                >
                                    도서 확인
                                </button>
                            ) : (
                                <p className="loan-status">
                                    {library.loanStatus === '현재 대출 가능' ? (
                                        <span style={{color: 'green'}}>{library.loanStatus}</span>
                                    ) : (
                                        <span style={{color: 'red'}}>{library.loanStatus}</span>
                                    )}
                                </p>
                            )}
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
