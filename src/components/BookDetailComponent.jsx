// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initializeKakaoMap, addUserMarker, addLibraryMarkers, getLibraries } from '../services/BookDetailService';
import '../css/BookDetailComponent.css';

const BookDetailComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookDetails = location.state?.bookDetails;

    const [libraries, setLibraries] = useState([]);
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);

    // 지도 초기화
    useEffect(() => {
        const scriptExists = !!window.kakao;

        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=ce20020febdbc7fbd8fbedaf35eeb4e8&libraries=services`;
            script.async = true;
            script.onload = () => {
                const mapObj = initializeKakaoMap('map', setError);
                setMap(mapObj);
            };
            document.head.appendChild(script);
        } else {
            const mapObj = initializeKakaoMap('map', setError);
            setMap(mapObj);
        }
    }, []);

    // 현재 위치 마커 추가
    useEffect(() => {
        if (map) {
            addUserMarker(map, setError);
        }
    }, [map]);

    // 도서관 리스트 가져오기
    useEffect(() => {
        const fetchLibraries = async () => {
            if (!bookDetails?.isbn13) return;

            try {
                const libs = await getLibraries(bookDetails.isbn13);
                setLibraries(libs);
            } catch (err) {
                console.error('Error fetching libraries:', err);
                setError('도서관 정보를 가져오는 중 오류가 발생했습니다.');
            }
        };

        fetchLibraries();
    }, [bookDetails?.isbn13]);

    // 도서관 마커 추가
    useEffect(() => {
        if (map && libraries.length > 0) {
            addLibraryMarkers(map, libraries);
        }
    }, [map, libraries]);

    if (!bookDetails) {
        return (
            <div className="book-details-page">
                <h2>No Book Details Available</h2>
                <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
            </div>
        );
    }

    return (
        <div className="book-details-page">
            <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
            <h1>{bookDetails.bookname}</h1>
            <div className="book-detail-content">
                <img src={bookDetails.bookImageURL} alt={bookDetails.bookname} className="book-detail-image" />
                <div className="book-details-info">
                    <p><strong>저자명:</strong> {bookDetails.authors}</p>
                    <p><strong>출판사:</strong> {bookDetails.publisher}</p>
                    <p><strong>출판연도:</strong> {bookDetails.publication_year}</p>
                    <p><strong>ISBN:</strong> {bookDetails.isbn13}</p>
                </div>
            </div>
            <div id="map" style={{ width: '100%', height: '400px', margin: '20px 0' }}></div>
            <h2>Libraries with this Book</h2>
            {error && <p className="error">{error}</p>}
            {libraries.length > 0 ? (
                <ul className="library-list">
                    {libraries.map((library, index) => (
                        <li key={index} className="library-item">
                            <h3>{library.libName}</h3>
                            <p>주소: {library.address}</p>
                            <p>운영 시간: {library.operatingTime || '운영 시간 정보 없음'}</p>
                            <p>전화번호: {library.tel || '전화번호 정보 없음'}</p>
                            {library.homepage && (
                                <a
                                    href={library.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="library-link"
                                >
                                    홈페이지
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No library information available.</p>
            )}
        </div>
    );
};

export default BookDetailComponent;
