import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../css/Header.css";

function Header({ isLoggedIn, handleLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700); // 초기값 설정
    const location = useLocation();
    const navigate = useNavigate();

    // 로그인/회원가입 버튼을 숨길 경로 목록
    const hideAuthButtonsPaths = ['/login', '/signup'];

    // 현재 경로가 숨길 목록에 포함되면 true
    const shouldHideAuthButtons = hideAuthButtonsPaths.includes(location.pathname);

    // 마이페이지 버튼 숨기기 조건
    const shouldHideMyPageButton = location.pathname === '/user';

    // 화면 크기 감지 및 메뉴 상태 업데이트
    useEffect(() => {
        const handleResize = () => {
            const mobileView = window.innerWidth <= 700;
            setIsMobile(mobileView);
            if (!mobileView) {
                setMenuOpen(true); // 데스크톱 모드에서는 메뉴 항상 열림
            } else {
                setMenuOpen(false); // 모바일 모드에서 기본적으로 메뉴 접힘
            }
        };

        handleResize(); // 초기 렌더링 시 실행
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <header className="header">
            <h1
                onClick={() => navigate('/')}
                style={{cursor: 'pointer'}}
            >
                도서관 통합 검색
            </h1>
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
            {(menuOpen || !isMobile) && (
                <nav className="navbar">
                    <a href="#" onClick={() => navigate('/')}>홈</a>
                    {!shouldHideAuthButtons && (
                        <>
                            {isLoggedIn ? (
                                <>
                                    <a href="#" onClick={handleLogout}>로그아웃</a>
                                    {!shouldHideMyPageButton && (
                                        <a href="#" onClick={() => navigate('/user')}>마이페이지</a>
                                    )}
                                </>
                            ) : (
                                <>
                                    <a href="#" onClick={() => navigate('/login')}>로그인</a>
                                    <a href="#" onClick={() => navigate('/signup')}>회원가입</a>
                                </>
                            )}
                        </>
                    )}
                </nav>
            )}
        </header>
    );
}

export default Header;
