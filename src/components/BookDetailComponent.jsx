// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/BookDetailComponent.css';

const BookDetailComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookDetails = location.state?.bookDetails;

    const [libraries, setLibraries] = useState([]); // 도서관 리스트 상태
    const [loading, setLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 도서관 리스트 가져오기
    useEffect(() => {
        const fetchLibraries = async () => {
            if (!bookDetails?.isbn13) return;

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `http://localhost:8081/api/libraries?isbn=${bookDetails.isbn13}&region=11&pageNo=1&pageSize=10`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch libraries');
                }

                const data = await response.json();
                setLibraries(data.libs || []);
            } catch (err) {
                console.error('Error fetching libraries:', err);
                setError('Could not fetch library information');
            } finally {
                setLoading(false);
            }
        };

        fetchLibraries();
    }, [bookDetails?.isbn13]);

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
                {/* 책 이미지 */}
                <img
                    src={bookDetails.bookImageURL}
                    alt={bookDetails.bookname}
                    className="book-detail-image"
                />
                {/* 책 세부 정보 */}
                <div className="book-details-info">
                    <p><strong>Authors:</strong> {bookDetails.authors}</p>
                    <p><strong>Publisher:</strong> {bookDetails.publisher}</p>
                    <p><strong>Publication Year:</strong> {bookDetails.publication_year}</p>
                    <p><strong>ISBN-13:</strong> {bookDetails.isbn13}</p>
                    <p><strong>Loan Count:</strong> {bookDetails.loan_count}</p>
                </div>
            </div>
            <a
                href={bookDetails.bookDtlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-link"
            >
                More Information
            </a>

            {/* 도서관 정보 출력 */}
            <h2>Available Libraries</h2>
            {loading && <p>Loading library information...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
                <ul className="library-list">
                    {libraries.length > 0 ? (
                        libraries.map((item, index) => (
                            <li key={index} className="library-item">
                                <h3>{item.lib.libName}</h3>
                                <p>주소: {item.lib.address}</p>
                                <p>운영 시간: {item.lib.operatingTime}</p>
                            </li>
                        ))
                    ) : (
                        <p>No library information available.</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default BookDetailComponent;
