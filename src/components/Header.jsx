import React, {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import "../css/Header.css";

function Header({isLoggedIn, handleLogout}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 700); // 초기값 설정
    const [activeSection, setActiveSection] = useState("section1"); // 활성화된 섹션 ID
    const location = useLocation();
    const navigate = useNavigate();

    // 로그인/회원가입 버튼을 숨길 경로 목록
    const hideAuthButtonsPaths = ['/login', '/signup'];

    // 현재 경로가 숨길 목록에 포함되면 true
    const shouldHideAuthButtons = hideAuthButtonsPaths.includes(location.pathname);

    // 마이페이지 버튼 숨기기 조건
    const shouldHideMyPageButton = location.pathname === '/user';

    // 네비게이션 바를 표시할 페이지 경로 설정
    const showNavbarPages = ['/user'];

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


    //로그아웃 시 경로설정
    const handleLogoutAndRedirect = () => {
        handleLogout();
        if (location.pathname === '/user') {
            navigate('/'); // 마이페이지였을 때는 홈으로 이동
        }
    };

    ///////////////////my-navbar
    useEffect(() => {
        const sections = document.querySelectorAll("[data-section]");

        // Intersection Observer Callback
        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.getAttribute("data-section"));
                }
            });
        };

        // Intersection Observer Options
        const observerOptions = {
            root: null, // 뷰포트를 기준으로
            threshold: 0.5, // 50% 이상 보일 때 감지
        };

        // Initialize Intersection Observer
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const rootElement = document.documentElement;
        rootElement.style.scrollBehavior = 'smooth';

        return () => {
            rootElement.style.scrollBehavior = 'auto';
        };
    }, []);

    const scrollToSection = (sectionId) => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth",  block: "center" });
        }
    };

    return (
        <header className="header-container">
            <div className="header">
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
                                        <a href="#" onClick={handleLogoutAndRedirect}>로그아웃</a>
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
            </div>

            {/* 특정 페이지에서만 네비게이션 바 표시 */}
            {showNavbarPages.includes(location.pathname) && (
                <nav className="my-navbar">
                    <ul className="my-navbar-list">
                        {["section1", "section2", "section3", "section4"].map((sectionId) => (
                            <li
                                key={sectionId}
                                className={`my-navbar-item ${
                                    activeSection === sectionId ? "active" : ""
                                }`}
                            >
                                <a
                                    href={`#${sectionId}`}
                                    className="my-navbar-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(sectionId);
                                    }}
                                >
                                    {sectionId === "section1"
                                        ? "사용자 정보"
                                        : sectionId === "section2"
                                            ? "도서 대출 내역"
                                            : sectionId === "section3"
                                                ? "즐겨찾기 목록"
                                                : "추천 도서"}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
}

export default Header;
