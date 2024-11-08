import React, { useState } from 'react';
import { signup } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import '../css/SignupComponent.css';

export default function SignupComponent() {
  const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const handleSignup = async () => {

    // 공백 체크
    if (!username.trim() || !loginId.trim() || !password.trim() || !email.trim()) {
      setMessage("값을 입력해주세요");
      return;
    }
    
    // 사용자 이름 특수문자 체크
    const usernameRegex = /^[가-힣a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      setMessage("사용자 이름은 한글, 영문자, 숫자로 입력해주세요.");
      return;
    }

    // loginId 영어와 숫자만 체크
    const loginIdRegex = /^[a-zA-Z0-9]{4,20}$/;
    if (!loginIdRegex.test(loginId)) {
      setMessage("아이디는 영문자와 숫자로 4자 이상 20자 이하로 입력해주세요.");
      return;
    }

    // 비밀번호 제한사항: 최소 8자, 반드시 특수문자 포함
    const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setMessage("비밀번호는 최소 8자 이상이어야 하며, 반드시 특수문자를 포함해야 합니다");
      return;
    }

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("유효한 이메일 주소를 입력해주세요");
      return;
    }

    try {
      await signup({ username, loginId, password, email });
      alert('회원가입 성공!');
      navigate('/'); // 회원가입 후 메인페이지로 이동
    } catch (error) {
      if (error.response) {
        // 서버가 응답했으나 상태 코드가 2xx가 아닌 경우
        console.error('Error status:', error.response.status); // e.g., 404
        console.error('Error data:', error.response.data);
      } else if (error.request) {
        // 요청이 전송되었으나 응답이 없는 경우
        console.error('No response received:', error.request);
      } else {
        // 설정 중 발생한 다른 오류
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <div className='center'>
      <h2>회원가입</h2>
      <input
        type="text"
        placeholder="사용자 이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
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
      <input
        type="text"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSignup}>가입</button>
      <button onClick={handleBack}>취소</button>
      {message && <p>{message}</p>}
    </div>
  );
}