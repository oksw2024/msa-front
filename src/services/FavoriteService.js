import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/favorites';

// 즐겨찾기 호출
export const getFavorites = async (accessToken) => {
    if (!accessToken) {
        console.error('Access token is missing');
        throw new Error('Access token is required to fetch favorites');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/get`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

// 즐겨찾기 추가
export const addFavorite = async (accessToken, bookDetails) => {
    const {
        isbn13: bookIsbn,
        bookname: bookTitle,
        authors: author,
        publisher,
        publication_year: publicationYear,
        bookImageURL: bookImageUrl,
    } = bookDetails;

    return axios.post(
        `${API_BASE_URL}/add`,
        { bookIsbn, bookTitle, author, publisher, publicationYear, bookImageUrl },
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );
};

// 즐겨찾기 삭제
export const removeFavorite = async (accessToken, bookIsbn) => {
    try {
        await axios.delete(`${API_BASE_URL}/remove`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            data: { bookIsbn },
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

//추천도서 호출
export const getRecommendedBooks = async (accessToken) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("Recommendations API Response:", response.data); // 디버깅용
        return response.data;
    } catch (error) {
        console.error("Error fetching recommended books:", error.response?.data || error.message);
        throw error;
    }
};
