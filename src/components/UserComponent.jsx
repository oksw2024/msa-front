import React, { useEffect, useState } from 'react';
import {getFavorites, removeFavorite, getRecommendedBooks} from '../services/FavoriteService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserComponent() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
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
  const [isEditingField, setIsEditingField] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const handleFindUser = async () => {
    console.log('check calling');
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      const response = await axios.get('http://localhost:8080/api/v1/user', {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      console.log("handleFindUser response : ", response);
      setUserData(response.data);
    } catch (error) {
      console.error('Error handleFindUser response:', error.response);

      if (error.response && error.response.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            setMessage('Failed to find refresh token.');
            return;
          }

          const refreshResponse = await axios.get('http://localhost:8080/api/v1/auth/refresh', {
            headers: { REFRESH_TOKEN: refreshToken },
          });

          const newAccessToken = refreshResponse.data;
          localStorage.setItem('accessToken', newAccessToken);
          setMessage('Token refreshed successfully.');
          console.log('new accessToken:', newAccessToken);

          const retryResponse = await axios.get('http://localhost:8080/api/v1/user', {
            headers: { Authorization: `Bearer ${newAccessToken}`},
          });

          console.log('retry response : ', retryResponse);

          setUserData(retryResponse.data);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError.response);

          if(refreshError.response?.status === 403) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          }
        }
      } else if (error.response.status === 500) {
        setMessage('모든 값을 입력해주세요');
      } else {
        setMessage('Failed to call user');
      }
    }
  };

  const handleUpdateUser = async (field) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      const updatedData = { [field]: formData[field] || userData[field] };

      console.log('updatedData being sent:', updatedData);
      const response = await axios.put('http://localhost:8080/api/v1/user', updatedData, {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      console.log("handleUpdateUser response : ", response);

      setMessage('User updated successfully.');
      setUserData({ ...userData, ...updatedData});
      setIsEditingField((prev) => ({ ...prev, [field]: false }));
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
            headers: { REFRESH_TOKEN: refreshToken },
          });

          const newAccessToken = refreshResponse.data;
          localStorage.setItem('accessToken', newAccessToken);
          setMessage('Token refreshed successfully.');
          console.log('new accessToken:', newAccessToken);

          console.log('updatedData being sent:', updatedData);
          const retryResponse = await axios.put('http://localhost:8080/api/v1/user', updatedData, {
            headers: { Authorization: `Bearer ${newAccessToken}`},
          });

          console.log('retry response : ', retryResponse);

          setMessage('User updated successfully.');
          setUserData({ ...userData, ...updatedData });
          setIsEditingField((prev) => ({ ...prev, [field]: false }));
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError.response);

          if(refreshError.response?.status === 403) {
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

  const handleCancelEdit = (field) => {
    if (isEditingField[field]) {
      setFormData((prev) => ({ ...prev, [field]: userData[field]}));
      setIsEditingField((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    console.log('calling test');
    handleFindUser();
    console.log('username : ', isEditingField.username);
    console.log('email : ', isEditingField.email);
    console.log('password : ', isEditingField.password);
  }, []);
  
  useEffect(() => {
    console.log('rendering. isEditingField:', isEditingField);
  }, [isEditingField]);

  const handleAddBook = async () => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('accesstoken : ', accessToken);
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }

    if (!validateDates()) {
      return;
    }

    const newBook = {
      ...bookInfo
    };

    console.log("book : ", newBook);

    try {
      const response = await axios.post('http://localhost:8080/api/books/add', newBook, {
        headers: { Authorization: `Bearer ${accessToken}`},
      });
      console.log("response : ", response);

      setBooks([...books, response.data]);
      setBookInfo({ title: '', library: '', loanDate: '', returnDate: ''});
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
            headers: { REFRESH_TOKEN: refreshToken },
          });

          const newAccessToken = refreshResponse.data;
          localStorage.setItem('accessToken', newAccessToken);
          setMessage('Token refreshed successfully.');
          console.log('new accessToken:', newAccessToken);

          const retryResponse = await axios.post('http://localhost:8080/api/books/add', newBook, {
            headers: { Authorization: `Bearer ${newAccessToken}`},
          });

          console.log('retry response : ', retryResponse);

          setBooks([...books, retryResponse.data]);
          setBookInfo({ title: '', library: '', loanDate: '', returnDate: ''});
          setMessage('Book added successfully after refreshing token.');
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError.response);

          if(refreshError.response?.status === 403) {
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
  }

  //삭제 (명목상 추가한거라 구현하신 기능으로 바꿔주세요)
  const handleDeleteBook = async (bookId) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        setMessage('No access token found.');
        return;
    }
    try {
        await axios.delete(`http://localhost:8080/api/books/${bookId}`, {
            headers: {Authorization: `Bearer ${accessToken}`},
        });
        setBooks(books.filter((book) => book.id !== bookId));
        setMessage('Book deleted successfully.');
    } catch (error) {
        setMessage('Failed to delete book.');
    }
  };

  useEffect(() => {
    console.log('calling test 2');
    const fetchBooks = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await axios.get('http://localhost:8080/api/books/get', {
          headers: { Authorization: `Bearer ${accessToken}`},
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
              headers: { REFRESH_TOKEN: refreshToken },
            });
  
            const newAccessToken = refreshResponse.data;
            localStorage.setItem('accessToken', newAccessToken);
            setMessage('Token refreshed successfully.');
            console.log('new accessToken:', newAccessToken);

            const retryResponse2 = await axios.get('http://localhost:8080/api/books/get', {
              headers: { Authorization: `Bearer ${newAccessToken}`},
            });

            console.log('retry response : ', retryResponse2);
            setBooks(retryResponse2.data);
          } catch (refreshError) {
            if(refreshError.response?.status === 403) {
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

  useEffect(() => {
    const fetchUserData = async () => {
      await handleFindUser();
    };
    fetchUserData();
  }, []);

  ////////////////////////////////즐겨찾기
  // 즐겨찾기 목록 가져오기
  const fetchFavorites = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    try {
        const favoriteList = await getFavorites(accessToken);
        setFavorites(favoriteList);
    } catch (error) {
        setMessage('Failed to fetch favorites.');
    }
  };

  // 즐겨찾기 제거
  const handleRemoveFavorite = async (bookIsbn) => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          setMessage('No access token found.');
          return;
      }
      try {
          await removeFavorite(accessToken, bookIsbn);
          setFavorites(favorites.filter((fav) => fav.bookIsbn !== bookIsbn));
          setMessage('Favorite removed successfully.');
      } catch (error) {
          setMessage('Failed to remove favorite.');
      }
  };

  useEffect(() => {
      const fetchUserAndBooks = async () => {
          await handleFindUser();
          fetchFavorites(); // 즐겨찾기 목록 가져오기
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
              return;
          }
          try {
              const recommendations = await getRecommendedBooks(accessToken);
              console.log("Fetched recommendations:", recommendations); // 디버깅용
              setRecommendedBooks(recommendations);
          } catch (error) {
              console.error("Failed to fetch recommendations:", error);
          }
      };

      fetchRecommendations();
  }, []);


  const handleTitleClick = (book) => {
      console.log("Clicked Book:", book);
      const bookDetails = {
          isbn13: book.isbn13 || "N/A",
          bookname: book.bookname || "Unknown Title",
          authors: book.authors || book.author || "Unknown Author",
          publisher: book.publisher || "Unknown Publisher",
          publication_year: book.publication_year || "Unknown Year",
          bookImageURL: book.bookImageURL || "",
      };
      console.log("Navigating with bookDetails:", bookDetails); // 디버깅용 로그
      navigate(`/book/details`, {state: {bookDetails}});
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
                    {userData ? (
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

                {/* 도서 리스트 섹션 */}
                <section className="books-section">
                    <h2>도서 대출 내역</h2>

                    {/* 도서 추가 섹션 */}
                    <div className="add-book-form">
                        <input
                            type="text"
                            name="title"
                            placeholder="도서명"
                            value={bookInfo.title}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="library"
                            placeholder="대출 도서관"
                            value={bookInfo.library}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="loanDate"
                            value={bookInfo.loanDate}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="returnDate"
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
                                <li key={fav.bookIsbn} className="favorite-item">
                                    <img
                                        src={fav.bookImageUrl}
                                        alt={fav.bookTitle}
                                        style={{cursor: "pointer"}}
                                        onClick={() => handleTitleClick(fav)}
                                    />
                                    <div>
                                <span
                                    className="favorite-title"
                                    onClick={() => handleTitleClick(fav)}
                                >
                                    {fav.bookTitle}
                                </span>
                                        <p><strong>저자:</strong> {fav.author.replace(/지은이:/g, "")
                                            .replace(/;/g, " | ")}</p>
                                        <p><strong>출판사:</strong> {fav.publisher}</p>
                                        <p><strong>출판연도:</strong> {fav.publicationYear}</p>
                                    </div>
                                    <button onClick={() => handleRemoveFavorite(fav.bookIsbn)}>
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
