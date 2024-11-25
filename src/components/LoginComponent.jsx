import React, { useState } from 'react';
import { login } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import "../css/LoginComponent.css";

function LoginComponent({ onLogin }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const handleLogin = async () => {
    setIdMessage('');
    setPasswordMessage('');
    setMessage('');

    if (!loginId.trim()) {
      setIdMessage("아이디를 입력해주세요.");
      return;
    } else if (!password.trim()) {
      setPasswordMessage("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await login({ loginId, password });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      onLogin();
      alert('로그인 성공!');
      navigate('/'); // 로그인 후 메인 페이지로 이동
    } catch (error) {
      setMessage('아이디 혹은 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className='center'>
      <h2>로그인</h2>
      <input
        type="text"
        placeholder="아이디"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
      />
      {idMessage && <p>{idMessage}</p>}
      <div className='password-container'>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
        >{showPassword ? "숨기기" : "보기"}</button>
      </div>
      {passwordMessage && <p>{passwordMessage}</p>}
      {message && <p>{message}</p>}
      <div className='button-container'>
        <button onClick={handleLogin}>로그인</button>
        <button onClick={handleBack}>취소</button>
      </div>
    </div>
  );
}

export default LoginComponent;
