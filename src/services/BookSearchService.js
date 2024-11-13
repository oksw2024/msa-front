// BookSearchService.js
import axios from 'axios';

// 책 검색 서비스 함수
export const getBooks = async (type, query, page = 0, size = 5) => {
    const baseUrl = 'http://localhost:8080/api/book/list';
    const url = `${baseUrl}?searchType=${type}&keyword=${query}&pageSize=${size}&pageNo=${page + 1}`;

    try {
        const response = await axios.get(url);

        // 응답 데이터 처리
        const data = response.data;
        const docs = data.response?.docs || [];
        const numFound = data.response?.numFound || 0; // 총 검색 결과 개수
        const totalPages = Math.ceil(numFound / size); // 총 페이지 수 계산

        return {
            books: docs,
            totalPages, // 총 페이지 수 반환
        };
    } catch (error) {
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
