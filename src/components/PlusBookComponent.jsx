import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/PlusBookComponent.css";

export default function PlusBookComponent() {
    // useLocation 훅을 사용하여 전달된 state 데이터 가져오기
    const location = useLocation();
    const navigate = useNavigate();

    // navigate로 전달된 state에서 데이터와 제목 가져오기
    const { books = [], title = "도서 목록" } = location.state || {}; // 기본값 설정

    // state가 없거나 잘못된 경우 처리
    if (!books || !Array.isArray(books) || books.length === 0) {
        return <p>데이터를 불러올 수 없습니다. 이전 페이지에서 다시 시도해주세요.</p>;
    }

    return (
        <div className="plus-book-container">
            <h1>{title}</h1>
            <ul className="book-list">
                {books.map((book, index) => (
                    <li key={index} className="book-item">
                        <img
                            src={book.doc.bookImageURL}
                            alt={book.doc.bookname}
                            className="book-image"
                        />
                        <div className="book-details">
                            <h4 className="book-title">{book.doc.bookname}</h4>
                            <p>
                                <strong>저자:</strong>{" "}
                                {book.doc.authors
                                    .replace(/지은이:/g, "")
                                    .replace(/;/g, " | ")}
                            </p>
                            <p><strong>출판사:</strong> {book.doc.publisher}</p>
                            <p><strong>출판연도:</strong> {book.doc.publication_year}</p>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/book/details`, {state: {bookDetails: book.doc}});
                                }}
                                className="book-link">상세정보
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
            <p
                onClick={() => navigate(-1)}
                className="back-link"
            >
                <span className="back-arrow">◀</span> 뒤로가기
            </p>
        </div>
    );
}