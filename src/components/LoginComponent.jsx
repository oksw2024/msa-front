import React, { useState } from 'react';
import { login } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import "../css/LoginComponent.css";

function LoginComponent({ onLogin }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const handleLogin = async () => {
    try {
      const response = await login({ loginId, password });
      alert('로그인 성공!');
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      onLogin();
      navigate('/'); // 로그인 후 메인 페이지로 이동
    } catch (error) {
      setMessage('Login failed.');
    }
  };

  return (
    <div className='center'>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="아이디"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={handleBack}>취소</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginComponent;
