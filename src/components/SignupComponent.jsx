import React, { useState } from 'react';
import { signup } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import "../css/SignupComponent.css";

export default function SignupComponent() {
  const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTest, setPasswordTest] = useState('');
  const [email, setEmail] = useState('');

  const [nameMessage, setNameMessage] = useState('');
  const [idMessage, setIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [checkMessage, setCheckMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTest, setShowPasswordTest] = useState(false);
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const togglePasswordTestVisivility = () => {
    setShowPasswordTest(!showPasswordTest);
  }

  const handleSignup = async () => {
    setNameMessage("");
    setIdMessage("");
    setPasswordMessage("");
    setCheckMessage("");
    setEmailMessage("");

    // 공백 체크
    if (!username.trim()) {
      setNameMessage("사용자 이름을 입력해주세요.");
      return;
    } else if (!loginId.trim()) {
      setIdMessage("아이디를 입력해주세요.");
      return;
    } else if (!password.trim()) {
      setPasswordMessage("비밀번호를 입력해주세요.");
      return;
    } else if (!passwordTest.trim()) {
      setCheckMessage("비밀번호 확인을 입력해주세요.");
      return;
    } else if (!email.trim()) {
      setEmailMessage("이메일을 입력해주세요.");
      return;
    }

    if (password !== passwordTest) {
      setCheckMessage("비밀번호가 일치하지 않습니다.");
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

  const handleBlur = (field) => {
    if (field === 'username') {
      const usernameRegex = /^[가-힣a-zA-Z0-9]+$/;
      if (!username.trim()) {
        setNameMessage('사용자 이름을 입력해주세요.');
      } else if (!usernameRegex.test(username)){
        setNameMessage("사용자 이름은 한글, 영문자, 숫자로 입력해주세요.");
      } else {
        setNameMessage('');
      }
    } else if (field === 'loginId') {
      const loginIdRegex = /^[a-zA-Z0-9]{4,20}$/;
      if (!loginId.trim()) {
        setIdMessage('아이디를 입력해주세요.');
      } else if (!loginIdRegex.test(loginId)) {
        setIdMessage('아이디는 영문자와 숫자로 4자 이상 20자 이하로 입력해주세요.');
      } else {
        setIdMessage('');
      }
    } else if (field === 'password') {
      const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!password.trim()) {
        setPasswordMessage('비밀번호를 입력해주세요.');
      } else if (!passwordRegex.test(password)) {
        setPasswordMessage('비밀번호는 최소 8자 이상이어야 하며, 반드시 특수문자를 포함해야 합니다.');
      } else {
        setPasswordMessage('');
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        setEmailMessage('이메일을 입력해주세요.');
      } else if (!emailRegex.test(email)) {
        setEmailMessage('유효한 이메일 주소를 입력해주세요.');
      } else {
        setEmailMessage('');
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
        onBlur={() => handleBlur('username')}
        onChange={(e) => setUsername(e.target.value)}
      />
      {nameMessage && <p>{nameMessage}</p>}
      <input
        type="text"
        placeholder="아이디"
        value={loginId}
        onBlur={() => handleBlur('loginId')}
        onChange={(e) => setLoginId(e.target.value)}
      />
      {idMessage && <p>{idMessage}</p>}
      <div className='password-container'>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onBlur={() => handleBlur('password')}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
        >{showPassword ? "숨기기" : "보기"}</button>
      </div>
      {passwordMessage && <p>{passwordMessage}</p>}
      <div className='password-container'>
        <input
          type={showPasswordTest ? "text" : "password"}
          placeholder="비밀번호 확인"
          value={passwordTest}
          onBlur={() => handleBlur('passwordTest')}
          onChange={(e) => setPasswordTest(e.target.value)}
        />
        <button
          type="button"
          onClick={togglePasswordTestVisivility}
        >{showPasswordTest ? "숨기기" : "보기"}</button>
      </div>
      {checkMessage && <p>{checkMessage}</p>}
      <input
        type="text"
        placeholder="이메일"
        value={email}
        onBlur={() => handleBlur('email')}
        onChange={(e) => setEmail(e.target.value)}
      />
      {emailMessage && <p>{emailMessage}</p>}
      <div className='button-container'>
        <button onClick={handleSignup}>가입</button>
        <button onClick={handleBack}>취소</button>
      </div>
    </div>
  );
}
