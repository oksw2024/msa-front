import React, {useEffect, useRef, useState} from 'react';
import {deleteUser, findUser, updateUser} from '../services/UserService';
import {getFavorites, removeFavorite, getRecommendedBooks, removeAllFavorites} from '../services/FavoriteService';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import '../css/UserComponent.css'
import {addBook, fetchBooks, deleteBook} from "../services/BooknoteService.js";

export default function UserComponent({handleLogout}) {
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({username: "", email: ""}); // 초기화
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState([]);
    const [bookInfo, setBookInfo] = useState({
        title: '',
        library: '',
        loanDate: '',
        returnDate: '',
    });
    const [isBookPopupOpen, setIsBookPopupOpen] = useState(false);
    const [bookPopupData, setBookPopupData] = useState(null);

    const [favorites, setFavorites] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3;
    const navigate = useNavigate();

    const [message, setMessage] = useState('');

    useEffect(() => {
        handleFindUser();
    }, []);

    const handleBack = () => {
        navigate('/');
    };

    const handleDeleteUser = async () => {
        try {
            // 1. 모든 즐겨찾기 삭제
            await removeAllFavorites();
            console.log('All favorites removed.');

            // 2. 유저 삭제
            await deleteUser();
            console.log('User deleted.');

            // 3. 클라이언트 로그아웃
            alert('회원탈퇴 성공!');
            localStorage.clear();
            handleLogout();
            navigate('/');
        } catch (error) {
            console.error('Error deleting user or favorites:', error);
            alert('Failed to delete user or favorites.');
        }
    };

    const handleFindUser = async () => {
        let retryCount = 0; // 재시도 횟수
        const maxRetries = 1; // 최대 재시도 횟수

        const fetchUserWithRetry = async () => {
            try {
                const user = await findUser(); // 사용자 데이터 요청
                if (user) {
                    setUserData(user); // 사용자 데이터 설정
                    setFormData({
                        username: user.username || "",
                        email: user.email || "",
                    });
                } else if (retryCount < maxRetries) {
                    retryCount += 1;
                    console.warn(`Retrying fetch user data... Attempt: ${retryCount}`);
                    setTimeout(fetchUserWithRetry, 1000); // 1초 지연 후 재시도
                } else {
                    console.error("Failed to fetch user data after 3 attempts.");
                    setMessage("사용자 데이터를 불러오지 못했습니다.");
                }
            } catch (error) {
                if (retryCount < maxRetries) {
                    retryCount += 1;
                    console.warn(`Retrying due to error... Attempt: ${retryCount}`);
                    setTimeout(fetchUserWithRetry, 1000); // 1초 지연 후 재시도
                } else {
                    console.error("Error fetching user data after 3 attempts:", error);
                    setMessage("사용자 데이터를 불러오는 중 오류가 발생했습니다.");
                }
            } finally {
                setIsLoading(false); // 로딩 상태 해제
            }
        };

        fetchUserWithRetry(); // 재시도 함수 호출
    };

    useEffect(() => {
        // userData 변경 시 formData 동기화
        setFormData({username: userData.username || "", email: userData.email || ""});
    }, [userData]);


    // 인풋 필드 값 구분
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        if (e.target.dataset.target === "bookInfo") {
            setBookInfo((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePasswordInputChange = (e) => {
        const {name, value} = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOpenModal = () => {
        setFormData({username: userData.username || "", email: userData.email || ""});
        setIsModalOpen(true);
    };

    const handleOpenPasswordModal = () => {
        setPasswordData({currentPassword: "", newPassword: ""});
        setIsPasswordModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
    };

    const handleUpdateUser = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setMessage('토큰을 찾을 수 없습니다.');
            return;
        }

        setIsLoading(true); // 로딩 시작
        try {
            await updateUser({...userData, ...formData}); // 사용자 데이터 업데이트
            await handleFindUser(); // 데이터 새로 불러오기
            setIsModalOpen(false); // 모달 닫기
            setMessage("사용자 정보가 업데이트되었습니다.");
        } catch (error) {
            setMessage("사용자 정보를 업데이트하지 못했습니다.");
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    const validatePasswordInput = () => {
        if (!passwordData.currentPassword) {
            setMessage("현재 비밀번호를 입력해주세요.");
            return false;
        }
        if (passwordData.newPassword.length < 8) {
            setMessage("새 비밀번호는 최소 8자 이상이어야 합니다.");
            return false;
        }
        if (!/[A-Za-z]/.test(passwordData.newPassword) || !/[0-9]/.test(passwordData.newPassword) || !/[!@#$%^&*]/.test(passwordData.newPassword)) {
            setMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.");
            return false;
        }
        return true;
    };

    const handleUpdatePassword = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setMessage('토큰을 찾을 수 없습니다.');
            return;
        }

        if (!validatePasswordInput()) return;

        setIsLoading(true); // 로딩 상태 시작
        try {
            const response = await axios.post(
                "http://localhost:8080/api/v1/user/change-password",
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                },
                {
                    headers: {Authorization: `Bearer ${accessToken}`},
                }
            );
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
            setIsPasswordModalOpen(false);

            // 비밀번호 변경 후 확인 팝업 띄움
            alert("비밀번호가 성공적으로 변경되었습니다.");

            // 유저 데이터 새로 불러오기
            await handleFindUser();
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message); // 오류 메시지 출력
            } else {
                alert("비밀번호 변경 중 오류가 발생했습니다.");
            }
        }
    };


    ///독서노트////

    const handleAddBook = async () => {
        //날짜 검증 추가
        if (!validateDates()) return;

        setBookPopupData({...bookInfo});
        setIsBookPopupOpen(true);
    };


    const handleSaveBook = async () => {
        try {
            const newBook = await addBook(bookPopupData);
            setBooks([...books, newBook]);
            setBookInfo({title: '', library: '', loanDate: '', returnDate: ''});
            setIsBookPopupOpen(false);

            setMessage('Book added successfully.');
        } catch (error) {
            if (error.response?.status === 401) {
                setMessage('Unauthorized. Please login again.');
            } else if (error.response?.status === 500) {
                setMessage('모든 값을 입력해주세요');
            } else {
                setMessage('Failed to add book.');
            }
        }
    };

    const handleCloseBookPopup = () => {
        setIsBookPopupOpen(false);
    };


    const handleDeleteBook = async (bookId) => {
        try {
            await deleteBook(bookId);
            const data = await fetchBooks();
            setBooks(data);
        } catch (error) {
            setMessage('Failed to delete book.');
        }
    };


    // 날짜 검증 추가
    const validateDates = () => {
        const {loanDate, returnDate} = bookInfo;
        const today = new Date().toISOString().split('T')[0]; // 현재 날짜 (YYYY-MM-DD 형식)

        if (!loanDate || !returnDate) {
            alert('대출 날짜와 반납 날짜를 입력하세요.');
            return false;
        }

        if (returnDate < today) {
            alert('반납 날짜는 오늘 이후여야 합니다.');
            return false;
        }

        if (loanDate >= returnDate) {
            alert('반납 날짜는 대출 날짜 이후여야 합니다.');
            return false;
        }

        return true;
    };

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const data = await fetchBooks();
                setBooks(data);
            } catch (error) {
                setMessage('Failed to fetch books.');
            }
        };

        loadBooks();
    }, []);


    ////////////////////////////////즐겨찾기
    // 즐겨찾기 목록 가져오기
    const fetchFavorites = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setMessage('No access token found.');
            setFavorites([]); // 상태 초기화
            return;
        }
        try {
            const favoriteList = await getFavorites();
            console.log("Fetched favorites:", favoriteList); // 데이터 확인

            if (!favoriteList || favoriteList.length === 0) {
                setMessage('즐겨찾기 목록이 비어 있습니다.');
                setFavorites([]);
                return;
            }

            const renamedFavorites = favoriteList.map(fav => ({
                authors: fav.author || "알 수 없음",
                bookname: fav.bookTitle || "Unknown Title",
                isbn13: fav.bookIsbn || "N/A",
                publication_year: fav.publicationYear || "Unknown Year",
                publisher: fav.publisher || "Unknown Publisher",
                bookImageURL: fav.bookImageUrl || "",
            }));

            setFavorites(renamedFavorites);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setMessage('Failed to fetch favorites.');
            setFavorites([]); // 에러 시 상태 초기화
        }
    };

    // 즐겨찾기 제거
    const handleRemoveFavorite = async (isbn13) => {
        try {
            await removeFavorite(isbn13);
            setFavorites(favorites.filter((fav) => fav.isbn13 !== isbn13));
            setMessage('Favorite removed successfully.');
        } catch (error) {
            setMessage('Failed to remove favorite.');
        }
    };
    useEffect(() => {
        const fetchUserAndBooks = async () => {
            setIsLoading(true);
            try {
                await Promise.all([handleFindUser(), fetchFavorites()]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setIsLoading(false);
        };
        fetchUserAndBooks();
    }, []);


    ////////////////////////////////추천도서
    // 제목 글자 수 제한
    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                console.error("No access token found");
                setMessage("No access token found.");
                return;
            }
            try {
                const recommendations = await getRecommendedBooks();
                if (recommendations.length === 0) {
                    setMessage('즐겨찾기 도서를 추가해 주십시오.');
                } else {
                    // 중복 제거 로직
                    const uniqueRecommendations = recommendations.filter((book, index, self) =>
                        index === self.findIndex(b => b.bookname === book.bookname)
                    );

                    setRecommendedBooks(uniqueRecommendations);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
                setMessage("Failed to fetch recommended books.");
            }
        };

        fetchRecommendations();
    }, []);


    const handleTitleClick = (bookDetails) => {
        if (!bookDetails) {
            console.error("No book data provided to handleTitleClick.");
            return;
        }

        console.log("Navigating with bookDetails:", bookDetails);

        navigate(`/book/details`, {state: {bookDetails}});
    };



    ///네비 바/////////////////
    const sectionsRef = useRef([]);

    const handleScroll = (e, targetId) => {
        e.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    const handleActiveLink = (id) => {
        const links = document.querySelectorAll(".my-navbar-item");
        links.forEach((link) => link.classList.remove("active"));
        const activeLink = Array.from(links).find((link) =>
            link.querySelector(`a[href="#${id}"]`)
        );
        if (activeLink) {
            activeLink.classList.add("active");
        }
    };

    useEffect(() => {
        const handleScrollObserver = () => {
            const middleOfViewport = window.innerHeight / 2;

            sectionsRef.current.forEach((section) => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= middleOfViewport && rect.bottom >= middleOfViewport) {
                    handleActiveLink(section.id);
                }
            });
        };

        // 섹션의 레퍼런스를 저장
        sectionsRef.current = Array.from(document.querySelectorAll(".my-section"));

        window.addEventListener("scroll", handleScrollObserver);

        return () => {
            window.removeEventListener("scroll", handleScrollObserver);
        };
    }, []);

    return (
        <div className="main-container">

            <div className="content-container">
                {/* 상단 배너 */}
                <section id="section1" data-section="section1" className="my-banner">
                    {isLoading ? (
                        <p>로딩 중...</p>
                    ) : userData.username ? (
                        <>
                            <h1>
                                안녕하세요, <strong>{userData.username}</strong>님!
                            </h1>
                            <div className="my-info">
                                {/* 이메일 정보 */}
                                <div className="email-info">
                                    <i className="fas fa-envelope"></i>
                                    <p>{userData.email}</p>
                                </div>
                                {/* 대출한 책 권수 */}
                                <div className="book-count">
                                    <i className="fas fa-book"></i>
                                    <p>현재 대출: {books.length}권</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>사용자 정보를 불러오는 중...</p>
                    )}
                </section>


                {/*임시 사용자 정보 수정 섹션*/}
                <section id="section1" data-section="section1" className="mysection-container">
                    <h2>사용자 정보</h2>
                    {!isModalOpen && !isPasswordModalOpen && (
                        <div className="user-details">
                            <div className="user-details-row">
                                <div className="user-details-label">이름</div>
                                <div className="user-details-value">{userData.username || "N/A"}</div>
                            </div>
                            <div className="user-details-row">
                                <div className="user-details-label">아이디</div>
                                <div className="user-details-value">{userData.loginId || "N/A"}</div>
                            </div>
                            <div className="user-details-row">
                                <div className="user-details-label">이메일</div>
                                <div className="user-details-value">{userData.email || "N/A"}</div>
                            </div>
                            <div className="user-details-buttons">
                                <button onClick={handleOpenModal}>사용자 정보 수정</button>
                                <button onClick={handleOpenPasswordModal}>비밀번호 변경</button>
                            </div>
                        </div>
                    )}

                    {/* 사용자 정보 수정 팝업 */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>이름</strong>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>이메일</strong>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button onClick={handleUpdateUser}>확인</button>
                                    <button onClick={handleCloseModal}>취소</button>
                                </div>
                            </div>
                        </div>

                    )}

                    {/* 비밀번호 변경 팝업 */}
                    {isPasswordModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>현재 비밀번호</strong>
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            className="form-input"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="mypassword-toggle"
                                            onClick={() =>
                                                setShowPassword((prev) => ({...prev, current: !prev.current}))
                                            }
                                        >
                                            {showPassword.current ? <i className="fas fa-eye-slash"></i> :
                                                <i className="fas fa-eye"></i>}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>새 비밀번호</strong>
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            className="form-input"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="mypassword-toggle"
                                            onClick={() =>
                                                setShowPassword((prev) => ({...prev, new: !prev.new}))
                                            }
                                        >
                                            {showPassword.new ? <i className="fas fa-eye-slash"></i> :
                                                <i className="fas fa-eye"></i>}
                                        </button>
                                    </div>
                                </div>
                                <div className="modal-buttons">
                                    <button onClick={handleUpdatePassword}>확인</button>
                                    <button onClick={handleClosePasswordModal}>취소</button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 도서 리스트 섹션 */}
                <section id="section2" data-section="section2" className="mysection-container">
                    <h2>도서 대출 내역</h2>

                    {/* 도서 추가 섹션 */}
                    {!isBookPopupOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>도서명</strong>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        data-target="bookInfo"
                                        value={bookInfo.title}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>대출 도서관</strong>
                                    </label>
                                    <input
                                        type="text"
                                        name="library"
                                        data-target="bookInfo"
                                        value={bookInfo.library}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>대출 날짜</strong>
                                    </label>
                                    <input
                                        type="date"
                                        name="loanDate"
                                        data-target="bookInfo"
                                        value={bookInfo.loanDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-row">
                                    <label className="form-label">
                                        <strong>반납 날짜</strong>
                                    </label>
                                    <input
                                        type="date"
                                        name="returnDate"
                                        data-target="bookInfo"
                                        value={bookInfo.returnDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="modal-buttons">
                                    <button onClick={handleAddBook}>추가</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 도서 추가 확인용 팝업 창 */}
                    {isBookPopupOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h3>대출 도서를 추가하시겠습니까?</h3>
                                <p>
                                    <strong>도서명:</strong> {bookPopupData?.title}
                                </p>
                                <p>
                                    <strong>도서관:</strong> {bookPopupData?.library}
                                </p>
                                <p>
                                    <strong>대출 날짜:</strong> {bookPopupData?.loanDate}
                                </p>
                                <p>
                                    <strong>반납 날짜:</strong> {bookPopupData?.returnDate}
                                </p>
                                <div className="modal-buttons">
                                    <button onClick={handleSaveBook}>저장</button>
                                    <button onClick={handleCloseBookPopup}>취소</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <ul className="books-list">
                        {books.map((book) => (
                            <li key={book.id} className="book-card">
                                <span><strong>도서명:</strong> {book.title}</span>
                                <span><strong>도서관:</strong> {book.library}</span>
                                <span><strong>대출 날짜:</strong> {book.loanDate}</span>
                                <span><strong>반납 날짜:</strong> {book.returnDate}</span>
                                <button
                                    className="mydelete-button"
                                    onClick={() => handleDeleteBook(book.id)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 즐겨찾기 섹션 */}
                <section id="section3" data-section="section3" className="mysection-container">
                    <h2>즐겨찾기 목록</h2>

                    <ul className="fav-list">
                        {favorites.length > 0 ? (
                            favorites.map((fav) => (
                                <li key={fav.isbn13} className="fav-card">
                                    <button
                                        className="mydelete-button"
                                        onClick={() => handleRemoveFavorite(fav.isbn13)}
                                        aria-label="삭제"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                    {/* 책 이미지 */}
                                    <img
                                        src={fav.bookImageURL || "/placeholder.png"}
                                        alt={fav.bookname || "이미지 없음"}
                                        className="fav-image"
                                        onClick={() => handleTitleClick(fav)}
                                        style={{cursor: "pointer"}}
                                    />
                                    {/* 책 정보 */}
                                    <div className="fav-details">
                                        <h3
                                            className="fav-title"
                                            onClick={() => handleTitleClick(fav)} // 제목 클릭 시 이동
                                            style={{cursor: "pointer"}} // 클릭 가능한 스타일
                                        >
                                            {fav.bookname || "제목 없음"}
                                        </h3>
                                        <p className="fav-info">
                                            <strong>저자:</strong>{" "}
                                            {(fav.authors || "알 수 없음")
                                                .replace(/지은이:/g, "")
                                                .replace(/;/g, " | ")}
                                        </p>
                                        <p className="fav-info">
                                            <strong>출판사:</strong> {fav.publisher || "출판사 정보 없음"}
                                        </p>
                                        <p className="fav-info">
                                            <strong>출판연도:</strong> {fav.publication_year || "연도 정보 없음"}
                                        </p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>즐겨찾기 목록이 비어 있습니다.</p>
                        )}
                    </ul>
                </section>


                {/* 추천 도서 섹션*/}
                <section id="section4" data-section="section4" className="mysection-container">
                    <h2>추천 도서</h2>

                    {recommendedBooks.length > 0 ? (
                        <div className="my-carousel-container">
                            {/* 왼쪽 화살표 */}
                            <button
                                className="main-arrow left"
                                onClick={() =>
                                    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))
                                }
                                disabled={currentPage === 0}
                            >
                            </button>

                            <div className="main-carousel">
                                <ul className='main-horizontal-list'>
                                    {recommendedBooks
                                        .slice(
                                            currentPage * itemsPerPage,
                                            (currentPage + 1) * itemsPerPage
                                        )
                                        .map((book, index) => (
                                            <li key={index} className="recommendation-card">
                                                <img
                                                    src={book.bookImageURL}
                                                    alt={book.bookname}
                                                    className="mainbook-image"
                                                    onClick={() => handleTitleClick(book)}
                                                    style={{cursor: "pointer"}}
                                                />
                                                <div className="recommendation-details">
                                                    <h4
                                                        className="recommendation-title"
                                                        onClick={() => handleTitleClick(book)}
                                                        style={{cursor: "pointer"}}
                                                    >
                                                        {truncateText(book.bookname, 18)}
                                                    </h4>
                                                </div>
                                            </li>
                                        ))}
                                    {/* 빈 요소 추가 */}
                                    {Array.from({
                                        length: itemsPerPage -
                                            recommendedBooks.slice(
                                                currentPage * itemsPerPage,
                                                (currentPage + 1) * itemsPerPage
                                            ).length,
                                    }).map((_, index) => (
                                        <li key={`empty-${index}`} className="recommendation-card empty"></li>
                                    ))}
                                </ul>
                            </div>

                            {/* 오른쪽 화살표 */}
                            <button
                                className="main-arrow right"
                                onClick={() =>
                                    setCurrentPage((prevPage) =>
                                        Math.min(
                                            prevPage + 1,
                                            Math.ceil(recommendedBooks.length / itemsPerPage) -
                                            1
                                        )
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    Math.ceil(recommendedBooks.length / itemsPerPage) - 1
                                }
                            >
                            </button>
                        </div>
                    ) : (
                        <p>추천 도서가 없습니다.</p>
                    )}
                </section>


                <a
                    href="#"
                    onClick={removeAllFavorites}
                    className="detail-back-button"
                >모든 즐겨찾기 삭제
                </a>

                <a
                    href="#"
                    onClick={handleDeleteUser}
                    className="detail-back-button"
                >회원탈퇴
                </a>

                {/*경고문구, 나중에 수정*/}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

