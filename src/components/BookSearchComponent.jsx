import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBooks } from '../services/BookSearchService';
import '../css/BookSearchComponent.css';


const BookSearchComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    const [searchType, setSearchType] = useState(''); // 검색 옵션 상태
    const [results, setResults] = useState([]); // 검색 결과 상태
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 번호
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [pageSize] = useState(5); // 한 페이지에 표시할 데이터 수

    // 초기 로드 시 쿼리 파라미터에서 검색어 추출
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('query') || '';
        const type = searchParams.get('type') || '';
        const page = parseInt(searchParams.get('pageNo'), 10) || 0;

        setSearchQuery(query);
        setSearchType(type);
        setCurrentPage(page);

        if (query) {
            executeSearch(query, type, page); // 검색 실행
        }
    }, [location.search]);

    // 검색 실행 함수
    const executeSearch = async (query, type, page = 0) => {
        console.log('Executing search with:', { query, type, page, pageSize });
        try {
            const { books, totalPages } = await getBooks(type || 'keyword', query, page, pageSize);

            setResults(books);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
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
        setCurrentPage(page);
        navigate(`/book/list?query=${encodeURIComponent(searchQuery)}&type=${searchType}&pageNo=${page}`);
    };

    // 페이지 번호 생성 함수
    const generatePageNumbers = () => {
        const maxVisiblePages = 5;
        const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages);
        const adjustedStartPage = Math.max(0, endPage - maxVisiblePages);

        return Array.from({ length: endPage - adjustedStartPage }, (_, i) => adjustedStartPage + i);
    };

    return (
        <div className="search-page">
            {/* 검색창 */}
            <div className="search-bar">
                <div className="search-container">
                    <form onSubmit={handleSearchSubmit}>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="search-filter"
                        >
                            <option value="">전체 검색</option>
                            <option value="title">제목</option>
                            <option value="author">저자</option>
                        </select>
                        <div className="search-input-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="검색어를 입력하세요"
                                className="search-input"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* 검색 결과 */}
            <section>
                <div className="search-results">
                    <h3 className="search-result-title"><span style={{color: '#3f7aaa'}}>{searchQuery}</span> 검색 결과</h3>
                    <div className="search-book-list">
                        {Array.isArray(results) && results.length > 0 ? (
                            results.map((result, index) => (
                                <div key={index} className="search-book-item">
                                    <img src={result.bookImageURL} alt={result.bookname} className="search-book-image"/>
                                    <div>
                                        <h4 className="search-book-result-title">{result.bookname}</h4>
                                        <p className="search-book-author">{result.authors.replace(/;/g, ' | ')}</p>
                                        <p className="search-book-publisher">{result.publisher}</p>
                                        <p className="search-book-year">출판연도: {result.publication_year}</p>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(`/book/details`, {state: {bookDetails: result}});
                                            }}
                                            className="search-book-link">상세정보</a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No results found.</p>
                        )}
                    </div>
                </div>
            </section>

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
                                    aria-label="Previous page"
                                    tabIndex={currentPage === 0 ? -1 : 0}
                                >
                                    &laquo;
                                </button>
                            </li>
                            {/* 페이지 번호 버튼 */}
                            {generatePageNumbers().map((pageNum) => (
                                <li key={pageNum} className={`page-item ${pageNum === currentPage ? 'active' : ''}`}>
                                    <button
                                        className="page-link" onClick={() => handlePageChange(pageNum)}
                                        aria-label={`Page ${pageNum + 1}`}
                                        tabIndex={0}
                                    >
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
                                    aria-label="Next page"
                                    tabIndex={currentPage === totalPages - 1 ? -1 : 0}
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
