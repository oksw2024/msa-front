import React, { useState } from 'react';
import { login } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import "../css/LoginComponent.css";

function LoginComponent({ onLogin }) {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [idMessage, setIdMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // 중복 클릭 방지용 상태
    const navigate = useNavigate();

    const handleBack = async () => {
        navigate('/');
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const handleLogin = async () => {
        if (isSubmitting) return; // 중복 실행 방지

        setIdMessage('');
        setPasswordMessage('');
        setIsSubmitting(true);

        // 입력값 검증
        let hasError = false;
        if (!loginId.trim()) {
            setIdMessage("아이디를 입력해주세요.");
            hasError = true;
        }

        if (!password.trim()) {
            setPasswordMessage("비밀번호를 입력해주세요.");
            hasError = true;
        }

        // 에러 발생 시 로직 중단
        if (hasError) {
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await login({ loginId, password });
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            onLogin()
            navigate(-2); // 나중에 확인

        } catch (error) {
            setPasswordMessage('아이디 혹은 비밀번호가 틀렸습니다.');
        } finally {
            setIsSubmitting(false); // 로직 완료 후 상태 초기화
        }
    };

    return (
        <div className='card-container'>
            <button className='login-back-button' onClick={handleBack}>
                뒤로가기
            </button>
            <div className='card'>
                <h2>로그인</h2>
                <div className="input-container">
                    <i className="fas fa-user input-icon"></i>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                    />
                </div>
                {idMessage && <p className="error">{idMessage}</p>}
                <div className="input-container">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                    </button>
                </div>
                {passwordMessage && <p className="error">{passwordMessage}</p>}
                <div className='button-container'>
                    <button onClick={handleLogin} disabled={isSubmitting}>
                        {isSubmitting ? "로그인 중..." : "로그인"}
                    </button>
                </div>
                <p className="additional-text">
                    아직 회원이 아니신가요? <span onClick={() => navigate('/signup')}>회원가입</span>
                </p>
            </div>
        </div>

    );
}

export default LoginComponent;