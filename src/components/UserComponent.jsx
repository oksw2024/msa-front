import React, {useEffect, useState} from 'react';
import {deleteUser, findUser, updateUser, changePassword} from '../services/UserService';
import {getFavorites, removeFavorite, getRecommendedBooks, removeAllFavorites} from '../services/FavoriteService';
import {useNavigate} from 'react-router-dom';
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

    const [passwordMessage, setPasswordMessage] = useState('');
    const [newPasswordMessage, setNewPasswordMessage] = useState('');
    const [userNameMessage, setUserNameMessage] = useState('');
    const [userEmailMessage, setUserEmailMessage] = useState('');
    const [borrowMessage1, setBorrowMessage1] = useState('');
    const [borrowMessage2, setBorrowMessage2] = useState('');
    const [borrowMessage3, setBorrowMessage3] = useState('');
    const [borrowMessage4, setBorrowMessage4] = useState('');

    useEffect(() => {
        handleFindUser();
        fetchRecommendations();
    }, []);

    const handleDeleteUser = async () => {
        try {
            // 1. 모든 즐겨찾기 삭제
            await removeAllFavorites();
            console.log('All favorites removed.');

            // 2. 유저 삭제
            await deleteUser();
            console.log('User deleted.');

            // 3. 클라이언트 로그아웃
            alert('회원탈퇴가 완료되었습니다.');
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
        const maxRetries = 2; // 최대 재시도 횟수

        const fetchUserWithRetry = async () => {
            try {
                const user = await findUser(); // 사용자 데이터 요청
                if (user) {
                    console.log("User data fetched successfully:", user);
                    setUserData(user); // 사용자 데이터 설정
                    setFormData({
                        username: user.username || "",
                        email: user.email || "",
                    });
                } else {
                    throw new Error("No user data returned.");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying fetch user data... Attempt ${retryCount}`);
                    setTimeout(fetchUserWithRetry, 1000);
                }
            } finally {
                setIsLoading(false);
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
        setPasswordMessage('');
        setNewPasswordMessage('');
        setIsPasswordModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
    };

    const handleUpdateUser = async () => {
        if (!validateFormData()) return; // 유효성 검사 실패 시 종료

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            return;
        }

        setIsLoading(true); // 로딩 시작
        try {
            await updateUser({...userData, ...formData}); // 사용자 데이터 업데이트
            await handleFindUser(); // 데이터 새로 불러오기
            setIsModalOpen(false); // 모달 닫기
            alert("사용자 정보가 업데이트되었습니다.");
        } catch (error) {
            alert("사용자 정보 업데이트에 실패하였습니다.");
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    const validateFormData = () => {
        let isValid = true;

        // 이름 유효성 검사
        if (!/^[a-zA-Z0-9가-힣\s]+$/.test(formData.username)) {
            setUserNameMessage("사용자 이름에는 특수문자를 포함할 수 없습니다.");
            isValid = false;
        } else {
            setUserNameMessage("");
        }

        // 이메일 유효성 검사
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setUserEmailMessage("올바른 이메일 형식을 입력해주세요.");
            isValid = false;
        } else {
            setUserEmailMessage("");
        }

        return isValid;
    };

    const validatePasswordInput = () => {
        if (!passwordData.currentPassword) {
            setPasswordMessage("현재 비밀번호를 입력해주세요.");
            return false;
        } else {
            setPasswordMessage('');
        }

        if (!/[A-Za-z]/.test(passwordData.newPassword) || !/[0-9]/.test(passwordData.newPassword) || !/[!@#$%^&*]/.test(passwordData.newPassword)) {
            setNewPasswordMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.");
            return false;
        } else if (passwordData.newPassword.length < 8) {
            setNewPasswordMessage("새 비밀번호는 최소 8자 이상이어야 합니다.");
            return false;
        } else {
            setNewPasswordMessage('');
        }
        return true;
    };

    const handleUpdatePassword = async () => {

        if (!validatePasswordInput()) return;
        setIsLoading(true);

        try {
            await changePassword(passwordData.currentPassword, passwordData.newPassword);

            setIsPasswordModalOpen(false);
            alert("비밀번호가 성공적으로 변경되었습니다.");

            // 유저 데이터 새로 불러오기
            await handleFindUser();
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message); // 오류 메시지 출력
            } else {
                alert("비밀번호 변경 중 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false); // 로딩 상태 종료
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
        } catch (error) {
            console.error("error : ", error);
        }
    };

    const handleCloseBookPopup = () => {
        setIsBookPopupOpen(false);
    };


    const handleDeleteBook = async (bookId) => {
        const confirmation = window.confirm("해당 대출 내역을 삭제하시겠습니까?");
        if (!confirmation) return; // 사용자가 취소를 누르면 종료
        try {
            await deleteBook(bookId);
            const data = await fetchBooks();
            setBooks(data);
        } catch (error) {
            console.error("error : ", error);
        }
    };


    // 날짜 검증 추가
    const validateDates = () => {
        const {title, library, loanDate, returnDate} = bookInfo;
        const today = new Date().toISOString().split('T')[0]; // 현재 날짜 (YYYY-MM-DD 형식)

        // 도서명 검사
        if (!title.trim()) {
            setBorrowMessage1("도서명을 입력해주세요.");
            return false;
        } else {
            setBorrowMessage1('');
        }

        // 대출 도서관 검사
        if (!library.trim()) {
            setBorrowMessage2("대출 도서관을 입력해주세요.");
            return false;
        } else {
            setBorrowMessage2('');
        }

        if (!loanDate || !returnDate) {
            setBorrowMessage3('대출 날짜와 반납 날짜를 입력하세요.');
            setBorrowMessage4('대출 날짜와 반납 날짜를 입력하세요.');
            return false;
        } else {
            setBorrowMessage3('');
            setBorrowMessage4('');
        }

        if (returnDate < today) {
            setBorrowMessage4('반납 날짜는 오늘 이후여야 합니다.');
            return false;
        } else {
            setBorrowMessage4('');
        }

        if (loanDate >= returnDate) {
            setBorrowMessage4('반납 날짜는 대출 날짜 이후여야 합니다.');
            return false;
        } else {
            setBorrowMessage4('');
        }

        return true;
    };

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const data = await fetchBooks();
                setBooks(data);
            } catch (error) {
                console.error('Failed to fetch books.', error);
            }
        };

        loadBooks();
    }, []);


    ////////////////////////////////즐겨찾기
    // 즐겨찾기 목록 가져오기
    const fetchFavorites = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setFavorites([]); // 상태 초기화
            return;
        }
        try {
            const favoriteList = await getFavorites();
            console.log("Fetched favorites:", favoriteList); // 데이터 확인

            if (!favoriteList || favoriteList.length === 0) {
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
            setFavorites([]); // 에러 시 상태 초기화
        }
    };

    // 즐겨찾기 제거
    const handleRemoveFavorite = async (isbn13) => {
        const confirmation = window.confirm("정말로 이 즐겨찾기를 삭제하시겠습니까?");
        if (!confirmation) return; // 사용자가 취소를 누르면 종료

        try {
            await removeFavorite(isbn13);
            setFavorites(favorites.filter((fav) => fav.isbn13 !== isbn13));
            await fetchRecommendations();
        } catch (error) {
            console.error("Failed to remove favorite.", error);
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

    //추천도서 갱신
    const fetchRecommendations = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.error("No access token found");
            return;
        }
        try {
            const recommendations = await getRecommendedBooks();
            if (recommendations.length === 0) {
                console.log("즐겨찾기 목록을 추가해주세요.");
            } else {
                // 중복 제거 로직
                const uniqueRecommendations = recommendations.filter((book, index, self) =>
                    index === self.findIndex(b => b.bookname === book.bookname)
                );

                setRecommendedBooks(uniqueRecommendations);
            }
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        }
    };

    const handleTitleClick = (bookDetails) => {
        if (!bookDetails) {
            console.error("No book data provided to handleTitleClick.");
            return;
        }

        console.log("Navigating with bookDetails:", bookDetails);

        navigate(`/book/details`, {state: {bookDetails}});
    };

    const handleDeleteAccount = (e) => {
        e.preventDefault(); // 기본 링크 동작 방지
        const confirmation = window.confirm("정말로 회원탈퇴 하시겠습니까?");
        if (confirmation) {
            handleDeleteUser();
        } else {
            alert("회원탈퇴가 취소되었습니다.");
        }
    };

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
                                {userNameMessage && <p className="myerror-message">{userNameMessage}</p>}
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
                                {userEmailMessage && <p className="myerror-message">{userEmailMessage}</p>}
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

                                {passwordMessage && <p className="myerror-message">{passwordMessage}</p>}

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
                                {newPasswordMessage && <p className="myerror-message">{newPasswordMessage}</p>}
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
                                {borrowMessage1 && <p className="myerror-message">{borrowMessage1}</p>}
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
                                {borrowMessage2 && <p className="myerror-message">{borrowMessage2}</p>}
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
                                {borrowMessage3 && <p className="myerror-message">{borrowMessage3}</p>}
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
                                {borrowMessage4 && <p className="myerror-message">{borrowMessage4}</p>}
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
                        {books.map((book) => {
                            const today = new Date();
                            const returnDate = new Date(book.returnDate);
                            const timeDiff = returnDate - today;
                            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 남은 날짜 계산
                            const isOverdue = daysLeft < 0; // 연체 여부 확인

                            return (
                                <li key={book.id} className="book-card">
                                    <span><strong>도서명:</strong> {book.title}</span>
                                    <span><strong>도서관:</strong> {book.library}</span>
                                    <span><strong>대출 날짜:</strong> {book.loanDate}</span>
                                    <span>
                                        <strong>반납 날짜:</strong>{" "}
                                        <span
                                            className={isOverdue ? "red-bold" : daysLeft <= 3 ? "red-bold" : ""}
                                        >
                                            {book.returnDate}{" "}
                                            {isOverdue
                                                ? "(연체)"
                                                : daysLeft <= 3
                                                    ? `(${daysLeft}일)`
                                                    : ""}
                                      </span>
                                    </span>
                                    <button
                                        className="mydelete-button"
                                        onClick={() => handleDeleteBook(book.id)}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </li>
                            );
                        })}
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
                                            {truncateText(fav.bookname, 15)}
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

                    {favorites.length <= 0 ? (
                        <p className='fav-list>추천 도서가 없습니다.</p>
                    ) : recommendedBooks.length > 0 ? (
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
                            <p className='fav-list'>추천 도서가 없습니다.</p>
                    )}
                </section>

                <section className="draw-section">
                    <a
                        href="#"
                        onClick={handleDeleteAccount}
                        className="withdraw-button"
                    >회원탈퇴
                    </a>
                </section>
            </div>
        </div>
    );
}

