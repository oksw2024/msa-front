import React, { useEffect, useState } from 'react';
import { findUser, updateUser } from '../services/UserService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserComponent() {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [books, setBooks] = useState([]);
  const [bookInfo, setBookInfo] = useState({
    title: '',
    library: '',
    loanDate: '',
    returnDate: '',
  });
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const handleFindUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      const response = await findUser(accessToken);
      setUserData(response);
    } catch (error) {
      setMessage('Failed to fetch user data.');
    }
  };

  const handleUpdateUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      await updateUser(accessToken, { username });
      setMessage('User updated successfully.');
    } catch (error) {
      setMessage('Failed to update user.');
    }
  };

  const handleAddBook = async () => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('accesstoken : ', accessToken);
    if (!accessToken) {
      setMessage('No access token found.');
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

  const handleInputChange = (e) => {
    const { name, value} = e.target;
    setBookInfo({ ...bookInfo, [name]: value});
  };

  useEffect(() => {
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

  return (
    <div>
      <h2>마이페이지</h2>
      <button onClick={handleFindUser}>사용자 정보</button>
      {userData && (
        <div>
          <h3>사용자 정보</h3>
          <p><strong>이름:</strong> {userData.username}</p>
          <p><strong>이메일:</strong> {userData.email}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="New Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleUpdateUser}>정보 수정</button>
      <button onClick={handleBack}>메인페이지로</button>
      {message && <p>{message}</p>}

      <div style={{ margin: '50px' }}></div>

      <section>
        <h3>도서 추가</h3>
        <div>
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
            placeholder="대출 날짜"
            value={bookInfo.loanDate}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="returnDate"
            placeholder="반납 날짜"
            value={bookInfo.returnDate}
            onChange={handleInputChange}
          />
          <button onClick={handleAddBook}>추가하기</button>
        </div>

        <h3>도서 리스트</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Array.isArray(books) && books.map((book, index) => (
            <li key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span>{book.title}</span>
              <span>{book.library}</span>
              <span>{book.loanDate}</span>
              <span>{book.returnDate}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}