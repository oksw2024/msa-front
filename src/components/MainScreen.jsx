import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import "../css/MainScreen.css";

export default function MainScreen() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('');
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [newBooks, setNewBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPage2, setCurrentPage2] = useState(0);
    const itemsPerPage = 3;
    const [loading, setLoading] = useState(false);

    // 중복 호출 방지 플래그
    const hasFetched = useRef(false);

    const fetchRecommendedBooks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/recommend/popular', {
                params: { pageNo: 0, pageSize: 20 },
            });
            console.log("1docs : ", response.data.response.docs);
            return response.data.response.docs || [];
        } catch (err) {
            throw new Error(err.message);
        }
    };

    const fetchNewBooks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/recommend/new');
            console.log("2docs : ", response.data.response.docs);
            return response.data.response.docs || [];
        } catch (err) {
            throw new Error(err.message);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return; // 이미 데이터가 fetch된 경우 실행하지 않음

        const fetchData = async () => {
            setLoading(true);
            try {
                const [recommended, newBooksData] = await Promise.all([
                    fetchRecommendedBooks(),
                    fetchNewBooks(),
                ]);
                setRecommendedBooks(recommended);
                setNewBooks(newBooksData);
            } catch (err) {
                console.error("error : ", err);
            } finally {
                setLoading(false);
                hasFetched.current = true; // 데이터를 가져온 후 플래그 설정
            }
        };
        fetchData();
    }, []);


    // 검색창에서 엔터를 눌렀을 때 BookSearchComponent로 이동
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/book/list?query=${encodeURIComponent(searchQuery)}&type=${encodeURIComponent(searchType)}`
            );
        }
    };

    // 배너////////////
    const slides = [
        {
            title: "손끝에서 만나는 지식",
            description: "다양한 자료와 소장 도서관을 간편하게 탐색하세요.",
        },
        {
            title: "지금 바로 검색하세요",
            description: "도서관 자료를 한눈에 확인하고 대출 정보를 확인해보세요.",
        },
        {
            title: "책과 함께 성장하세요",
            description: "새로운 책과 소식을 빠르게 만나보세요.",
        },
    ];

    const slideRef = useRef(null);
    const totalSlides = slides.length;

// 가상 슬라이드 배열
    const extendedSlides = [slides[totalSlides - 1], ...slides, slides[0]];

// 현재 슬라이드 인덱스
    const [currentIndex, setCurrentIndex] = useState(1); // 첫 번째 가상 슬라이드에서 시작
    const [isAnimating, setIsAnimating] = useState(false);

// 다음 슬라이드 이동
    const slideNext = () => {
        if (!isAnimating) {
            setIsAnimating(true);
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

// 슬라이드 애니메이션 및 순환 처리
    useEffect(() => {
        if (isAnimating) {
            const timeout = setTimeout(() => {
                setIsAnimating(false);

                if (currentIndex === totalSlides + 1) {
                    // 가상 마지막 슬라이드 → 실제 첫 번째 슬라이드
                    slideRef.current.style.transition = "none";
                    setCurrentIndex(1); // 실제 첫 번째 슬라이드 인덱스로 이동
                } else if (currentIndex === 0) {
                    // 가상 첫 번째 슬라이드 → 실제 마지막 슬라이드
                    slideRef.current.style.transition = "none";
                    setCurrentIndex(totalSlides); // 실제 마지막 슬라이드 인덱스로 이동
                }
            }, 500); // 애니메이션 지속 시간과 동일

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, isAnimating, totalSlides]);

// 슬라이드 위치 업데이트
    useEffect(() => {
        slideRef.current.style.transition = isAnimating ? "transform 0.5s ease-in-out" : "none";
        slideRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, [currentIndex, isAnimating]);

// 자동 슬라이드 설정
    useEffect(() => {
        const interval = setInterval(slideNext, 4500); // 3초마다 자동 이동
        return () => clearInterval(interval);
    }, []);

// 점 색상 동기화
    const activeIndex = (currentIndex - 1 + totalSlides) % totalSlides; // 가상 슬라이드 보정
    useEffect(() => {
        slides.forEach((_, index) => {
            const dot = document.querySelector(`.dot:nth-child(${index + 1})`);
            if (dot) {
                dot.classList.toggle("active", index === activeIndex);
            }
        });
    }, [activeIndex, slides]);


    // 도서 추천////////////////////
    const limitedBooks = recommendedBooks.slice(0, 6);
    const limitedBooks2 = newBooks.slice(0, 6);

    const paginatedBooks = limitedBooks.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const paginatedBooks2 = limitedBooks2.slice(
        currentPage2 * itemsPerPage,
        (currentPage2 + 1) * itemsPerPage
    );

    // 다음 페이지 버튼 클릭
    const handleNext = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(limitedBooks.length / itemsPerPage) - 1));
    };

    const handleNext2 = () => {
        setCurrentPage2((prevPage) => Math.min(prevPage + 1, Math.ceil(limitedBooks2.length / itemsPerPage) - 1));
    };

    // 이전 페이지 버튼 클릭
    const handlePrev = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

    const handlePrev2 = () => {
        setCurrentPage2((prevPage) => Math.max(prevPage - 1, 0));
    };

    //제목 글자 수 제한
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    return (
        <div className='main-screen'>
            {/* 검색창 */}
            <div className="search-bar">
                <div className="search-container">
                    <form onSubmit={handleSearchSubmit}>
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                            className="search-filter"
                        >
                            <option value="">전체 검색</option>
                            <option value="title">제목</option>
                            <option value="author">저자</option>
                        </select>
                        <div className="search-input-wrapper">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="검색어를 입력하세요"
                                className="search-input"
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className="banner-container">
                <div className="slider" ref={slideRef}>
                    {extendedSlides.map((slide, index) => (
                        <div className="slide" key={index}>
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                        </div>
                    ))}
                </div>
                <div className="dots">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${index === activeIndex ? "active" : ""}`}
                            onClick={() => setCurrentIndex(index + 1)} // 클릭 시 가상 슬라이드 보정
                        ></div>
                    ))}
                </div>
            </div>

            {/* 인기 대출 도서 표시 */}
            <section>
                <ul className="book-tab">
                    <li className="title">
                        <a href="#">인기 대출 도서</a>
                    </li>
                    <li className="plus">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/book/plus", {
                                    state: {
                                        books: recommendedBooks,
                                        title: "인기 도서 목록"
                                    }
                                });
                            }}
                        >
                            더보기 +
                        </a>
                    </li>
                </ul>

                {loading && <p>Loading recommended books...</p>}

                {paginatedBooks.length > 0 && (
                    <div className="main-carousel-container">
                        {/* 화살표 버튼을 carousel-container 외부로 이동 */}
                        <button
                            className="main-arrow left"
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                        ></button>

                        <div className="main-carousel">
                            <ul className="main-horizontal-list">
                                {paginatedBooks.map((book, index) => (
                                    <li key={index}>
                                        <img
                                            src={book.doc.bookImageURL}
                                            alt={book.doc.bookname}
                                            className="mainbook-image"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => navigate("/book/details", { state: { bookDetails: book.doc } })}
                                        />
                                        <div className="mainbook-details">
                                            <h4 className="book-title"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => navigate("/book/details", { state: { bookDetails: book.doc } })}
                                            >
                                                {truncateText(book.doc.bookname, 18)}
                                            </h4>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 오른쪽 화살표 */}
                        <button
                            className="main-arrow right"
                            onClick={handleNext}
                            disabled={currentPage === Math.ceil(limitedBooks.length / itemsPerPage) - 1}
                        ></button>
                    </div>
                )}
            </section>


            {/* 신규 도서 */}
            <section>
                <ul className='book-tab'>
                    <li className='title'>
                        <a href="#">신규 도서</a>
                    </li>
                    <li className='plus'>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/book/plus", {
                                    state: {
                                        books: newBooks,
                                        title: "신규 도서 목록"
                                    }
                                });
                            }}
                        >
                            더보기 +
                        </a>

                    </li>
                </ul>
                {loading && <p>Loading recommended books...</p>}

                {paginatedBooks2.length > 0 && (
                    <div className="main-carousel-container">
                        {/* 왼쪽 화살표 */}
                        <button
                            className="main-arrow left"
                            onClick={handlePrev2}
                            disabled={currentPage2 === 0}
                        ></button>

                        <div className="main-carousel">
                            <ul className='main-horizontal-list'>
                                {paginatedBooks2.map((book, index) => (
                                    <li key={index}>
                                        <img src={book.doc.bookImageURL}
                                             alt={book.doc.bookname}
                                             className="mainbook-image"
                                             style={{ cursor: "pointer" }} // 클릭 가능하게 표시
                                             onClick={() => navigate("/book/details", { state: { bookDetails: book.doc } })}
                                        />
                                        <div className='mainbook-details'>
                                            <h4 className="book-title"
                                                style={{ cursor: "pointer" }} // 클릭 가능하게 표시
                                                onClick={() => navigate("/book/details", { state: { bookDetails: book.doc } })}
                                            >
                                                {truncateText(book.doc.bookname, 18)}
                                            </h4>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* 오른쪽 화살표 */}
                        <button
                            className="main-arrow right"
                            onClick={handleNext2}
                            disabled={currentPage2 === Math.ceil(limitedBooks.length / itemsPerPage) - 1}
                        ></button>
                    </div>
                )}
            </section>
        </div>
    );
}