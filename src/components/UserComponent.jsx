import React, {useEffect, useState} from 'react';
import {findUser, updateUser} from '../services/UserService';
import {getFavorites, removeFavorite, getRecommendedBooks} from '../services/FavoriteService';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
//import '../css/UserComponent.css'
import {addBook, fetchBooks, deleteBook} from "../services/BooknoteService.js";

export default function UserComponent() {
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({username: "", email: ""}); // 초기화
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
            setFormData({username: user?.username || "", email: user?.email || ""});
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

        try {
            const newBook = await addBook(bookInfo);
            setBooks([...books, newBook]);
            setBookInfo({title: '', library: '', loanDate: '', returnDate: ''});
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

    const handleDeleteBook = async (bookId) => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          setMessage('No access token found.');
          return;
      }
  
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


    return (
        <div className="main-container">

            <div className="content-container">
                {/* 상단 배너 */}
                <section className="my-banner">
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
                <section className="mysection-container">
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
                                            className="toggle-password"
                                            onClick={() =>
                                                setShowPassword((prev) => ({...prev, current: !prev.current}))
                                            }
                                        >
                                            {showPassword.current ? "숨기기" : "표시"}
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
                                            className="toggle-password"
                                            onClick={() =>
                                                setShowPassword((prev) => ({...prev, new: !prev.new}))
                                            }
                                        >
                                            {showPassword.new ? "숨기기" : "표시"}
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
                <section className="mysection-container">
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
                <section className="mysection-container">
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
                <section className="mysection-container">
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
                                                />
                                                <div className="recommendation-details">
                                                    <h4
                                                        className="recommendation-title"
                                                        onClick={() => handleTitleClick(book)}
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


                {/*경고문구, 나중에 수정*/}
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}
