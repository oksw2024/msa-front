import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../services/UserService';
import "../css/MainScreen.css";

export default function MainScreen({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate();

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

  return (
    <header>
      <h1>메인페이지</h1>
      <nav>
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
  );
}
