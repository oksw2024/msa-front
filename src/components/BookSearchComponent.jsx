// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { fetchBooks } from '../services/BookSearchService';
import '../css/BookSearchComponent.css';

const BookSearchComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    const [searchType, setSearchType] = useState(null); // 검색 옵션 상태 (null, title, author)
    const [results, setResults] = useState([]); // 검색 결과 상태
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [pageSize] = useState(5); // 한 페이지에 표시할 데이터 수

    // 초기 로드 시 쿼리 파라미터에서 검색어 추출
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('query');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('pageNo'), 10) || 0;

        if (query) {
            setSearchQuery(query);
            setSearchType(type || ''); // 검색 옵션을 가져오거나 기본값 설정
            setCurrentPage(page);
            executeSearch(query, type, page); // 검색 실행
        }
    }, [location.search]);

    // 검색 실행 함수
    const executeSearch = async (query, type, page = 0) => {
        console.log('Executing search with:', { query, type, page, pageSize }); // 디버깅용
        const { books, totalPages } = await fetchBooks(type || 'keyword', query, page, pageSize);
        console.log('Fetched Books:', books); // 검색 결과 출력
        console.log('Total Pages:', totalPages); // 총 페이지 수 확인
        setResults(books);
        setTotalPages(totalPages);
    };

    // 검색어 제출 핸들러
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // 새로운 검색에서는 페이지를 0으로 초기화
        navigate(`/book/list?query=${encodeURIComponent(searchQuery)}&type=${searchType}&pageNo=0`);
    };

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        if (page < 0 || page >= totalPages) return; // 페이지 범위 초과 방지
        navigate(`/book/list?query=${encodeURIComponent(searchQuery)}&type=${searchType}&pageNo=${page}`);
    };

    // 페이지 버튼 생성
    const generatePageNumbers = () => {
        const maxVisiblePages = 5; // 고정된 페이징 버튼 수
        const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages);
        const adjustedStartPage = Math.max(0, endPage - maxVisiblePages);

        return Array.from({ length: endPage - adjustedStartPage }, (_, i) => adjustedStartPage + i);
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
                    {Array.isArray(results) && results.length > 0 ? (
                        results.map((result, index) => (
                            <div key={index} className="book-item">
                                <img src={result.doc.bookImageURL} alt={result.doc.bookname} className="book-image" />
                                <div className="book-details">
                                    <h4 className="book-title">{result.doc.bookname}</h4>
                                    <p className="book-author">by {result.doc.authors}</p>
                                    <p className="book-year">출판연도: {result.doc.publication_year}</p>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault(); // 기본 동작 막기
                                            navigate(`/book/details`, {state: {bookDetails: result.doc}}); // 책 정보를 state로 전달
                                        }}
                                        className="book-link">상세정보</a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No results found.</p>
                    )}
                </div>
            </div>

            {/* 페이징 버튼 */}
            {totalPages > 0 && (
                <nav className="pagination-container">
                    <ul className="pagination">
                        {/* 이전 페이지 버튼 */}
                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                            >
                                &laquo;
                            </button>
                        </li>
                        {/* 페이지 번호 버튼 */}
                        {generatePageNumbers().map((pageNum) => (
                            <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                    {pageNum + 1}
                                </button>
                            </li>
                        ))}
                        {/* 다음 페이지 버튼 */}
                        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                            >
                                &raquo;
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default BookSearchComponent;