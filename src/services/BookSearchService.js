// BookSearchService.js

export const fetchBooks = async (type, query, page = 0, size = 5) => {
    const baseUrl = 'https://data4library.kr/api/srchBooks';
    const apiKey = '246bc9a1a2ea4ba78b5ada1b16a0ba7e43537ef40b0427f80013629f7b593a86';
    const formattedQuery = query.split(' ').join(';'); // 검색어 공백을 ;로 변환

    // 기본 URL과 API 키, 형식 지정
    let url = `${baseUrl}?authKey=${apiKey}&format=json&pageSize=${size}&pageNo=${page + 1}`;

    // 검색 옵션에 따라 URL에 파라미터 추가
    if (type === 'title') {
        url += `&title=${formattedQuery}`;
    } else if (type === 'author') {
        url += `&author=${formattedQuery}`;
    } else {
        url += `&keyword=${formattedQuery}`; // 기본 keyword 검색
    }

    console.log('Request URL:', url); // URL을 출력하여 확인

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response Data:', data); // API 응답 출력

        // 결과 데이터에서 문서 리스트와 총 검색 결과 개수 반환
        const docs = data.response?.docs || [];
        const numFound = data.response?.numFound || 0; // 총 검색 결과 개수
        const totalPages = Math.ceil(numFound / size); // 총 페이지 수 계산

        return {
            books: docs,
            totalPages, // 총 페이지 수 반환
        };
    } catch (error) {
        console.error('Fetch error:', error);
        return {
            books: [],
            totalPages: 0,
        };
    }
};
