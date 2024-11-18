import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/PlusBookComponent.css";

export default function PlusBookComponent() {
  // useLocation 훅을 사용하여 전달된 state 데이터 가져오기
  const location = useLocation();
  const navigate = useNavigate();
  const recommendedBooks = location.state; // navigate로 전달된 state

  // state가 없거나 잘못된 경우 처리
  if (!recommendedBooks || !Array.isArray(recommendedBooks)) {
    return <p>데이터를 불러올 수 없습니다. 이전 페이지에서 다시 시도해주세요.</p>;
  }

  return (
    <div className="plus-book-container">
      <h1>인기 도서 목록</h1>
      <ul className="book-list">
        {recommendedBooks.map((book, index) => (
          <li key={index} className="book-item">
            <img
              src={book.doc.bookImageURL}
              alt={book.doc.bookname}
              className="book-image"
            />
            <div className="book-details">
              <h4>{book.doc.bookname}</h4>
              <p><strong>Author:</strong> {book.doc.authors}</p>
              <p><strong>Publisher:</strong> {book.doc.publisher}</p>
              <p><strong>Publication Year:</strong> {book.doc.publication_year}</p>
              <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    navigate(`/book/details`, { state: { bookDetails: book.doc } });
                }}
                className="book-link">상세정보
              </a>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(-1)} className='back-button'>뒤로가기</button>
    </div>
  );
}
