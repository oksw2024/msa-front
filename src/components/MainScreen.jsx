// eslint-disable-next-line no-unused-vars
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../services/UserService';
import "../css/MainScreen.css";

// eslint-disable-next-line react/prop-types
export default function MainScreen({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
  const [searchType, setSearchType] = useState(''); // 검색 옵션 상태

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
      // eslint-disable-next-line no-unused-vars
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

  return (
      <div className="main-screen">
        <header>
          <h1>메인페이지</h1>
          <nav className="nav-bar">
            {isLoggedIn ? (
                <>
                  <button onClick={handleLogout}>로그아웃</button>
                  <button onClick={handleDeleteUser}>회원탈퇴</button>
                  <button onClick={() => navigate('/user')}>마이페이지</button>
                </>
            ) : (
                <>
                  <button className="button loginButton" onClick={() => navigate('/login')}>로그인</button>
                  <button className="button signupButton" onClick={() => navigate('/signup')}>회원가입</button>
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
      </div>
  );
}