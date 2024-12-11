import React, {useState} from 'react';
import {signup} from '../services/AuthService';
import {useNavigate} from 'react-router-dom';
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

        const usernameRegex = /^[가-힣a-zA-Z0-9]+$/;
        if (!username.trim()) {
            setNameMessage('사용자 이름을 입력해주세요.');
            return;
        } else if (!usernameRegex.test(username)) {
            setNameMessage("사용자 이름은 한글, 영문자, 숫자로 입력해주세요.");
            return;
        } else {
            setNameMessage('');
        }

        const loginIdRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!loginId.trim()) {
            setIdMessage('아이디를 입력해주세요.');
            return;
        } else if (!loginIdRegex.test(loginId)) {
            setIdMessage('아이디는 영문자와 숫자로 4자 이상 20자 이하로 입력해주세요.');
            return;
        } else {
            setIdMessage('');
        }

        const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password.trim()) {
            setPasswordMessage('비밀번호를 입력해주세요.');
            return;
        } else if (!passwordRegex.test(password)) {
            setPasswordMessage('비밀번호는 최소 8자 이상이어야 하며, 반드시 특수문자를 포함해야 합니다.');
            return;
        } else {
            setPasswordMessage('');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setEmailMessage('이메일을 입력해주세요.');
            return;
        } else if (!emailRegex.test(email)) {
            setEmailMessage('유효한 이메일 주소를 입력해주세요.');
            return;
        } else {
            setEmailMessage('');
        }


        if (password !== passwordTest) {
            setCheckMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await signup({username, loginId, password, email});
            alert(username + '님, 가입을 환영합니다.');
            navigate('/'); // 회원가입 성공 후 메인 페이지로 이동
        } catch (error) {
            // 서버가 응답을 반환했으나 오류인 경우
            if (error.response) {
                const {status, data} = error.response;
                // 상태 코드별 오류 처리
                if (status === 400) {
                    alert(data.message || '입력값 오류: 다시 확인하세요.');
                } else if (status === 500) {
                    alert('서버 오류: 잠시 후 다시 시도하세요.');
                } else {
                    alert('알 수 없는 오류가 발생했습니다.');
                }
            } else if (error.request) {
                // 요청이 전송되었으나 응답이 없는 경우
                alert('서버로부터 응답이 없습니다. 네트워크를 확인해주세요.');
                console.error('No response received:', error.request);
            } else {
                // 설정 중 발생한 기타 오류
                alert('회원가입 처리 중 문제가 발생했습니다.');
                console.error('Error message:', error.message);
            }
        }
    };


    return (
        <div className="card-container">
            <button className='login-back-button' onClick={handleBack}>
                뒤로가기
            </button>
            <div className="card">
                <h2>회원가입</h2>

                <div className={`signup-input-container ${nameMessage ? 'error' : ''}`}>
                    <input
                        type="text"
                        id="username"
                        className="signup-input"
                        placeholder=" "
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="username" className="signup-label">사용자 이름</label>
                    {nameMessage && <p className="signup-error">{nameMessage}</p>}
                </div>

                <div className={`signup-input-container ${idMessage ? 'error' : ''}`}>
                    <input
                        type="text"
                        id="loginId"
                        className="signup-input"
                        placeholder=" "
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                    />
                    <label htmlFor="loginId" className="signup-label">아이디</label>
                    {idMessage && <p className="signup-error">{idMessage}</p>}
                </div>

                <div className={`signup-input-container ${passwordMessage ? 'error' : ''}`}>
                    <div className="signup-password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="signup-input"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="password" className="signup-label">비밀번호</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                        </button>
                    </div>
                    {passwordMessage && <p className="signup-error">{passwordMessage}</p>}
                </div>

                <div className={`signup-input-container ${checkMessage ? 'error' : ''}`}>
                    <div className="signup-password-wrapper">
                        <input
                            type={showPasswordTest ? "text" : "password"}
                            id="passwordTest"
                            className="signup-input"
                            placeholder=" "
                            value={passwordTest}
                            onChange={(e) => setPasswordTest(e.target.value)}
                        />
                        <label htmlFor="passwordTest" className="signup-label">비밀번호 확인</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordTestVisivility}
                        >
                            {showPasswordTest ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                        </button>
                    </div>
                    {checkMessage && <p className="signup-error">{checkMessage}</p>}
                </div>

                <div className={`signup-input-container ${emailMessage ? 'error' : ''}`}>
                    <input
                        type="email"
                        id="email"
                        className="signup-input"
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="email" className="signup-label">이메일</label>
                    {emailMessage && <p className="signup-error">{emailMessage}</p>}
                </div>
                <div className="signup-button-container">
                    <button onClick={handleSignup}>가입</button>
                </div>
            </div>
        </div>
    );
}