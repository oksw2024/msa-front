import axios from 'axios';

let isFetching = false; // API 호출 상태 추적

// 책 검색 서비스 함수
export const getBooks = async (type, query, page = 0, size = 5) => {
    if (isFetching) return { books: [], totalPages: 0 }; // 중복 호출 방지
    isFetching = true;

    const baseUrl = 'http://localhost:8080/api/book/list';
    const url = `${baseUrl}?searchType=${type}&keyword=${query}&pageSize=${size}&pageNo=${page + 1}`;

    try {
        const response = await axios.get(url);

        // API 호출 완료 플래그 초기화
        isFetching = false;

        // 올바른 JSON 경로에서 데이터 추출
        const docs = response.data?.response?.docs || [];
        const books = docs.map((docWrapper) => {
            const doc = docWrapper.doc;

            if (!doc) {
                console.error('검색 결과 없음');
                return null;
            }

            return {
                bookname: doc.bookname || '제목 없음',
                authors: doc.authors || '저자 정보 없음',
                publisher: doc.publisher || '출판사 정보 없음',
                publication_year: doc.publication_year || '출판연도 정보 없음',
                isbn13: doc.isbn13 || '',
                bookImageURL: doc.bookImageURL || '/default-image.png', // 기본 이미지 제공
                bookDtlUrl: doc.bookDtlUrl || '',
                loan_count: doc.loan_count || 0,
            };
        });

        const numFound = response.data?.response?.numFound || 0; // 총 검색 결과 개수
        const totalPages = Math.ceil(numFound / size); // 총 페이지 수 계산

        return {
            books, // 책 리스트
            totalPages, // 총 페이지 수 반환
        };
    } catch (error) {
        // 오류 발생 시 플래그 초기화
        isFetching = false;

        console.error('Axios error:', error.message);

        // 서버 응답이 있을 경우 세부 내용 로그 출력
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Status Code:', error.response.status);
        }

        return {
            books: [],
            totalPages: 0,
        };
    }
};
