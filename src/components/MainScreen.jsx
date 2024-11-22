import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { deleteUser } from '../services/UserService';
import "../css/MainScreen.css";

export default function MainScreen({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  const [searchType, setSearchType] = useState(''); // 검색 옵션 상태
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPage2, setCurrentPage2] = useState(0);
  const itemsPerPage = 3;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);

  const handleRecommendedBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8080/api/recommend/popular', {
        param: {
          pageNo: 0,
          pageSize: 20,
        },
      });

      setRecommendedBooks(response.data.response.docs || []);
      console.log("docs : ", recommendedBooks);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8080/api/recommend/new');

      setNewBooks(response.data.response.docs || []);
      console.log("docs : ", newBooks);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRecommendedBooks();
    handleNewBooks();
  }, []);

  const handleDeleteUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('No access token found.');
      return;
    }
    try {
      await deleteUser(accessToken);
      alert('회원탈퇴 성공!');
      localStorage.clear();
      handleLogout();
      navigate('/');
    } catch (error) {
      alert('Failed to delete user.');
    }
  };

  // 검색창에서 엔터를 눌렀을 때 BookSearchComponent로 이동
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/book/list?query=${encodeURIComponent(searchQuery.trim())}`); // 검색어 전달
    }
  };

  const limitedBooks = recommendedBooks.slice(0, 6);
  const limitedBooks2 = newBooks.slice(0, 6);

  const paginatedBooks = limitedBooks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const paginatedBooks2 = limitedBooks2.slice(
    currentPage2 * itemsPerPage,
    (currentPage2 + 1) * itemsPerPage
  );

  // 다음 페이지 버튼 클릭
  const handleNext = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(limitedBooks.length/ itemsPerPage) -1));
  };

  const handleNext2 = () => {
    setCurrentPage2((prevPage) => Math.min(prevPage + 1, Math.ceil(limitedBooks2.length/ itemsPerPage) -1));
  };

  // 이전 페이지 버튼 클릭
  const handlePrev = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handlePrev2 = () => {
    setCurrentPage2((prevPage) => Math.max(prevPage - 1, 0));
  };

  return (
    <div className='main-screen'>
      <header>
        <h1>메인페이지</h1>
        <nav className='nav-bar'>
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout}>
                로그아웃
              </button>
              <button onClick={handleDeleteUser}>
                회원탈퇴
              </button>
              <button onClick={() => navigate('/user')}>
                마이페이지
              </button>
            </>
          ) : (
            <>
              <button className='button loginButton' onClick={() => navigate('/login')}>
                로그인
              </button>
              <button className='button signupButton' onClick={() => navigate('/signup')}>
                회원가입
              </button>
            </>
          )}
        </nav>
      </header>

      {/* 검색 바 영역 */}
      <div className="search-container">
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

      {/* 인기 대출 도서 표시 */}
      <section>
        <ul className='book-tab'>
          <li className='book-popular'>
            <a href="#">인기 대출 도서</a>
          </li>
          <li className='plus'>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              navigate('/book/plus', {state: recommendedBooks})}}>더보기</a>
          </li>
        </ul>
        {loading && <p>Loading recommended books...</p>}
        {error && <p>Error: {error}</p>}

        {paginatedBooks.length > 0 && (
          <ul className='horizontal-list'>
            {paginatedBooks.map((book, index) => (
              <li key={index}>
                <img src={book.doc.bookImageURL} alt={book.doc.bookname} className="mainbook-image"/>
                <div className='book-details'>
                  <h4 className='book-title'>{book.doc.bookname}</h4>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 버튼 */}
        <div className="pagination-controls">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="pagination-button"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === Math.ceil(limitedBooks.length / itemsPerPage) -1}
            className="pagination-button"
          >
            다음
          </button>
        </div>
      </section>

      {/* 신규 도서 */}
      <section>
        <ul className='book-tab'>
          <li className='book-new'>
            <a href="#">신규 도서</a>
          </li>
          <li className='plus'>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              navigate('/book/plus', {state: newBooks})}}>더보기</a>
          </li>
        </ul>
        {loading && <p>Loading recommended books...</p>}
        {error && <p>Error: {error}</p>}

        {paginatedBooks2.length > 0 && (
          <ul className='horizontal-list'>
            {paginatedBooks2.map((book, index) => (
              <li key={index}>
                <img src={book.doc.bookImageURL} alt={book.doc.bookname} className="mainbook-image"/>
                <div className='book-details'>
                  <h4 className='book-title'>{book.doc.bookname}</h4>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 버튼 */}
        <div className="pagination-controls">
          <button
            onClick={handlePrev2}
            disabled={currentPage2 === 0}
            className="pagination-button"
          >
            이전
          </button>
          <button
            onClick={handleNext2}
            disabled={currentPage2 === Math.ceil(limitedBooks2.length / itemsPerPage) -1}
            className="pagination-button"
          >
            다음
          </button>
        </div>
      </section>
    </div>
  );
}
