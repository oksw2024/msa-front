import React, {useCallback, useEffect, useState} from 'react';
import {findUser, updateUser} from '../services/UserService';
import {getFavorites, removeFavorite, getRecommendedBooks} from '../services/FavoriteService';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import '../css/UserComponent.css'

export default function UserComponent() {
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({ username: "", email: "" }); // 초기화
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState([]);
    const [bookInfo, setBookInfo] = useState({
        title: '',
        library: '',
        loanDate: '',
        returnDate: '',
    });
    const [favorites, setFavorites] = useState([]);
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 3;
    const navigate = useNavigate();


    const handleBack = () => {
        navigate('/');
    };

    const handleFindUser = async () => {
        try {
            const user = await findUser(localStorage.getItem("accessToken"));
            setUserData(user || {});
            setFormData({ username: user?.username || "", email: user?.email || "" });
        } catch (error) {
            setMessage("사용자 데이터를 불러오지 못했습니다.");
        } finally {
            setIsLoading(false); // 로딩 상태 해제
        }
    };

    useEffect(() => {
        handleFindUser();
    }, []);

    useEffect(() => {
        // userData 변경 시 formData 동기화
        setFormData({ username: userData.username || "", email: userData.email || "" });
    }, [userData]);


    // 입력 값 변경 처리
    const handlePopupInputChange = (e) => {
        const {name, value} = e.target;
        setPopupFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOpenModal = () => {
        setFormData({ username: userData.username || "", email: userData.email || "" });
        setIsModalOpen(true);
    };

    const handleOpenPasswordModal = () => {
        setPasswordData({ currentPassword: "", newPassword: "" });
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
            await updateUser({ ...userData, ...formData }); // 사용자 데이터 업데이트
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
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setMessage("비밀번호가 성공적으로 변경되었습니다.");
            setIsPasswordModalOpen(false);

            // 비밀번호 변경 후 확인 팝업 띄움
            alert("비밀번호가 성공적으로 변경되었습니다.");

            // 유저 데이터 새로 불러오기
            await handleFindUser();
        } catch (error) {
            // 실패 처리
            if (error.response && error.response.data) {
                setMessage(error.response.data.message); // 백엔드 메시지 표시
            } else {
                setMessage("비밀번호 변경 중 오류가 발생했습니다.");
            }
        }
    };


    ///독서노트////

    const handleAddBook = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setMessage('No access token found.');
            return;
        }

        //날짜 검증 추가
        if (!validateDates()) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/books/add', newBook, {
                headers: {Authorization: `Bearer ${accessToken}`},
            });
            console.log("response : ", response);

            setBooks([...books, response.data]);
            setBookInfo({title: '', library: '', loanDate: '', returnDate: ''});
            setMessage('Book added successfully.');
        } catch (error) {
            console.error('Error response:', error.response);

            if (error.response && error.response.status === 401) {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!refreshToken) {
                        setMessage('Failed to find refresh token.');
                        return;
                    }

                    const refreshResponse = await axios.get('http://localhost:8080/api/v1/auth/refresh', {
                        headers: {REFRESH_TOKEN: refreshToken},
                    });

                    const newAccessToken = refreshResponse.data;
                    localStorage.setItem('accessToken', newAccessToken);
                    setMessage('Token refreshed successfully.');
                    console.log('new accessToken:', newAccessToken);

                    const retryResponse = await axios.post('http://localhost:8080/api/books/add', newBook, {
                        headers: {Authorization: `Bearer ${newAccessToken}`},
                    });

                    console.log('retry response : ', retryResponse);

                    setBooks([...books, retryResponse.data]);
                    setBookInfo({title: '', library: '', loanDate: '', returnDate: ''});
                    setMessage('Book added successfully after refreshing token.');
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError.response);

                    if (refreshError.response?.status === 403) {
                        setMessage('다시 로그인해주세요');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        navigate('/login');
                    }
                }
            } else if (error.response.status === 500) {
                setMessage('모든 값을 입력해주세요');
            } else {
                setMessage('Failed to add book.');
            }
        }
    };

    // 날짜 검증 추가
    const validateDates = () => {
        const {loanDate, returnDate} = bookInfo;
        const today = new Date().toISOString().split('T')[0]; // 현재 날짜 (YYYY-MM-DD 형식)

        if (!loanDate || !returnDate) {
            setMessage('대출 날짜와 반납 날짜를 입력하세요.');
            return false;
        }

        if (loanDate < today || returnDate < today) {
            setMessage('대출 날짜와 반납 날짜는 오늘 이후여야 합니다.');
            return false;
        }

        if (loanDate >= returnDate) {
            setMessage('반납 날짜는 대출 날짜 이후여야 합니다.');
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchBooks = async () => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await axios.get('http://localhost:8080/api/books/get', {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                console.log('Response data:', response.data);
                setBooks(response.data);
            } catch (error) {
                setMessage('Failed to add book.');
                console.error('Error response:', error.response);

                if (error.response && error.response.status === 401) {
                    try {
                        const refreshToken = localStorage.getItem('refreshToken');

                        if (!refreshToken) {
                            setMessage('Failed to find refresh token.');
                            return;
                        }

                        const refreshResponse = await axios.get('http://localhost:8080/api/v1/auth/refresh', {
                            headers: {REFRESH_TOKEN: refreshToken},
                        });

                        const newAccessToken = refreshResponse.data;
                        localStorage.setItem('accessToken', newAccessToken);
                        setMessage('Token refreshed successfully.');
                        console.log('new accessToken:', newAccessToken);

                        const retryResponse2 = await axios.get('http://localhost:8080/api/books/get', {
                            headers: {Authorization: `Bearer ${newAccessToken}`},
                        });

                        console.log('retry response : ', retryResponse2);
                        setBooks(retryResponse2.data);
                    } catch (refreshError) {
                        if (refreshError.response?.status === 403) {
                            setMessage('다시 로그인해주세요');
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            navigate('/login');
                        }
                    }
                }
            }
        };
        fetchBooks();
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
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setMessage('No access token found.');
            return;
        }
        try {
            await removeFavorite(accessToken, isbn13);
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
                await Promise.all([handleFindUser(), fetchFavorites(), fetchRecommendations(), fetchBooks()]);
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
                    setRecommendedBooks(recommendations);
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

    useEffect(() => {
        const fetchUserData = async () => {
            await handleFindUser(); // 사용자 데이터 가져오기
            setFormData(userData); // formData 초기화
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        console.log("formData:", formData);
        console.log("userData:", userData);
    }, [formData, userData]);

    const handleButtonClick = (field, action) => {
        if (action === "edit") {
            handleEditField(field);
        } else if (action === "cancel") {
            handleCancelEdit(field);
        }
    };

    return (
        <div className="main-container">
            {/* 좌측 네비게이션 바 */}
            <nav className="sidebar">
                <ul className="nav-list">
                    <li><a href="/">홈</a></li>
                    <li><a href="/profile">프로필</a></li>
                    <li><a href="/books">내 도서</a></li>
                    <li><a href="/settings">설정</a></li>
                    <li><a href="/logout">로그아웃</a></li>
                </ul>
            </nav>

            <div className="content-container">
                {/* 상단 배너 */}
                <div className="my-banner">
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
                </div>


                {/*임시 사용자 정보 수정 섹션*/}
                <div className="user-component">
                    <h1>사용자 정보</h1>
                    <div className="user-details">
                        <p>
                            <strong>이름:</strong> {userData.username || "N/A"}
                        </p>
                        <p>
                            <strong>이메일:</strong> {userData.email || "N/A"}
                        </p>
                        <button onClick={handleOpenModal}>사용자 정보 수정</button>
                        <button onClick={handleOpenPasswordModal}>비밀번호 변경</button>
                    </div>

                    {/* 사용자 정보 수정 팝업 */}
                    {isModalOpen && (
                        <div className="modal">
                            <div className="modal-content">
                                <h2>사용자 정보 수정</h2>
                                <label>
                                    <strong>이름:</strong>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </label>
                                <label>
                                    <strong>이메일:</strong>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </label>
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
                                <h2>비밀번호 변경</h2>
                                <label>
                                    <strong>현재 비밀번호:</strong>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                </label>
                                <label>
                                    <strong>새 비밀번호:</strong>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordInputChange}
                                    />
                                </label>
                                <button onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? "숨기기" : "표시"}
                                </button>
                                <div className="modal-buttons">
                                    <button onClick={handleUpdatePassword}>확인</button>
                                    <button onClick={handleClosePasswordModal}>취소</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 도서 리스트 섹션 */}
                <section className="books-section">
                    <h2>도서 대출 내역</h2>

                    {/* 도서 추가 섹션 */}
                    <div className="add-book-form">
                        <input
                            type="text"
                            name="title"
                            data-target="bookInfo"
                            placeholder="도서명"
                            value={bookInfo.title}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="library"
                            data-target="bookInfo"
                            placeholder="대출 도서관"
                            value={bookInfo.library}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="loanDate"
                            data-target="bookInfo"
                            value={bookInfo.loanDate}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="returnDate"
                            data-target="bookInfo"
                            value={bookInfo.returnDate}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleAddBook}>추가하기</button>
                    </div>

                    <ul className="books-list">
                        {books.map((book) => (
                            <li key={book.id} className="book-card">
                                <span><strong>도서명:</strong> {book.title}</span>
                                <span><strong>도서관:</strong> {book.library}</span>
                                <span><strong>대출 날짜:</strong> {book.loanDate}</span>
                                <span><strong>반납 날짜:</strong> {book.returnDate}</span>
                                <button onClick={() => handleDeleteBook(book.id)}>삭제</button>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 즐겨찾기 섹션 */}
                <section className="favorites-section">
                    <h2>즐겨찾기 목록</h2>
                    <ul className="favorites-list">
                        {favorites.length > 0 ? (
                            favorites.map((fav) => (
                                <li key={fav.isbn13} className="favorite-item">
                                    <img
                                        src={fav.bookImageURL}
                                        alt={fav.bookname}
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleTitleClick(fav)}
                                    />
                                    <div>
                                <span
                                    className="favorite-title"
                                    onClick={() => handleTitleClick(fav)}
                                >
                                    {fav.bookname}
                                </span>
                                        <p><strong>저자:</strong>{" "}
                                            {(fav.authors || "알 수 없음")
                                                .replace(/지은이:/g, "")
                                                .replace(/;/g, " | ")}</p>
                                        <p><strong>출판사:</strong> {fav.publisher}</p>
                                        <p><strong>출판연도:</strong> {fav.publication_year}</p>
                                    </div>
                                    <button onClick={() => handleRemoveFavorite(fav.isbn13)}>
                                        즐겨찾기 삭제
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p>즐겨찾기 목록이 비어 있습니다.</p>
                        )}
                    </ul>
                </section>

                {/* 추천 도서 섹션*/}
                <section className="recommendations-section">
                    <h2>추천 도서</h2>
                    {recommendedBooks.length > 0 ? (
                        <div className="carousel-container">
                            {/* 왼쪽 화살표 */}
                            <button
                                className="arrow left"
                                onClick={() =>
                                    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))
                                }
                                disabled={currentPage === 0}
                            >
                            </button>

                            <div className="carousel">
                                <ul className="horizontal-list">
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
                                                />
                                                <div className="recommendation-details">
                                                    <h4
                                                        className="recommendation-title"
                                                        onClick={() => handleTitleClick(book)}
                                                    >
                                                        {truncateText(book.bookname, 18)}
                                                    </h4>
                                                    <p>
                                                        <strong>저자:</strong>{" "}
                                                        {book.authors || "알 수 없음"}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* 오른쪽 화살표 */}
                            <button
                                className="arrow right"
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


                {/*경고문구, 나중에 수정*/}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

