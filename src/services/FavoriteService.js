// 미래의 나에게 : 건들지마 제발
import apiClient from './AxiosInstance';

// 즐겨찾기 호출
export const getFavorites = async () => {
    try {
        const response = await apiClient.get('/favorites/get');
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};

// 즐겨찾기 추가
export const addFavorite = async (bookDetails) => {
    try {
        console.log('Sending book details:', bookDetails); // 디버깅용 로그
        const response = await apiClient.post('/favorites/add', bookDetails, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding favorite:', error);
        if (error.response) {
            console.error('Server response:', error.response.data); // 서버 에러 메시지 출력
        }

        if (error.response?.status === 400) {
            alert('잘못된 요청입니다. 서버 요구사항을 확인하세요.');
        } else {
            alert('즐겨찾기 추가에 실패했습니다.');
        }

        throw error;
    }
};

// 즐겨찾기 삭제
export const removeFavorite = async (isbn13) => {
    try {
        await apiClient.delete('/favorites/remove', {
            data: { isbn13 },
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
    }
};

// 추천 도서 호출
export const getRecommendedBooks = async () => {
    try {
        const response = await apiClient.get('/favorites/recommendations');
        return response.data;
    } catch (error) {
        console.error('Error fetching recommended books:', error);
        throw error;
    }
};

// 해당 유저의 모든 즐겨찾기 삭제
export const removeAllFavorites = async () => {
    try {
        const response = await apiClient.delete('/favorites/remove-all');
        return response.data;
    } catch (error) {
        console.error('Error removing all favorites:', error);
        throw error;
    }
};
