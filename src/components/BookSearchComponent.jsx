// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchBooks } from '../services/BookSearchService';
import '../css/BookSearchComponent.css';

const BookSearchComponent = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    const [searchType, setSearchType] = useState(null); // 검색 옵션 상태 (null, title, author)
    const [results, setResults] = useState([]); // 검색 결과 상태

    // 초기 로드 시 쿼리 파라미터에서 검색어 추출
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('query');
        const type = searchParams.get('type');

        if (query) {
            setSearchQuery(query);
            setSearchType(type || ''); // 검색 옵션을 가져오거나 기본값 설정
            executeSearch(query, type); // 검색 실행
        }
    }, [location.search]);

    // 검색 실행 함수
    const executeSearch = async (query, type) => {
        // 검색 타입이 null이면 기본적으로 keyword로 검색
        const books = await fetchBooks(type || 'keyword', query);
        setResults(books);
    };

    // 검색어 제출 핸들러
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        executeSearch(searchQuery, searchType);
    };

    return (
        <div className="search-page">
            {/* 검색창 */}
            <div className="search-bar">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="search-select"
                    >
                        <option value="">All</option>
                        <option value="title">Book Name</option>
                        <option value="author">Author Name</option>
                    </select>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for books..."
                        className="search-input"
                    />
                    <button type="submit" className="search-button">검색</button>
                </form>
            </div>

            {/* 검색 결과 */}
            <div className="search-results">
                <h3 className="search-title">Search Results for "{searchQuery}"</h3>
                <div className="book-list">
                    {results.map((result, index) => (
                        <div key={index} className="book-item">
                            <img src={result.doc.bookImageURL} alt={result.doc.bookname} className="book-image" />
                            <div className="book-details">
                                <h4 className="book-title">{result.doc.bookname}</h4>
                                <p className="book-author">by {result.doc.authors}</p>
                                <p className="book-year">Published: {result.doc.publication_year}</p>
                                <a href={result.doc.bookDtlUrl} target="_blank" rel="noopener noreferrer" className="book-link">View Details</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookSearchComponent;