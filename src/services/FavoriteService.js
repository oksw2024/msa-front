import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/favorites';

// 즐겨찾기 호출
export const getFavorites = async (accessToken) => {
    if (!accessToken) {
        console.error('Access token is missing');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/get`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);

        if (error.response && error.response.status == 401) {
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
      
                const retryResponse = await axios.get(`${API_BASE_URL}/get`, {
                    headers: { Authorization: `Bearer ${newAccessToken}` },
                });

                console.log('retry response : ', retryResponse);
      
                return retryResponse.data;
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError.response);
      
                if(refreshError.response?.status === 403) {
                  setMessage('다시 로그인해주세요');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  navigate('/login');
                }
            }
        } else {
            setMessage('Failed to call favorite books.');
        }
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

    try {
        const response = await axios.post(
            `${API_BASE_URL}/add`,
            { bookIsbn, bookTitle, author, publisher, publicationYear, bookImageUrl },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites add:', error);

        if (error.response && error.response.status == 401) {
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
      
                const retryResponse = await axios.post(
                    `${API_BASE_URL}/add`,
                    { bookIsbn, bookTitle, author, publisher, publicationYear, bookImageUrl },
                    {
                        headers: { Authorization: `Bearer ${newAccessToken}` },
                    }
                );

                console.log('retry response : ', retryResponse);
      
                return retryResponse.data;
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError.response);
      
                if(refreshError.response?.status === 403) {
                  setMessage('다시 로그인해주세요');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  navigate('/login');
                }
            }
        } else {
            setMessage('Failed to add favorite books.');
        }
    }
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
        
        if (error.response && error.response.status == 401) {
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
      
                await axios.delete(`${API_BASE_URL}/remove`, {
                    headers: {
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                    data: { bookIsbn },
                });
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError.response);
      
                if(refreshError.response?.status === 403) {
                  setMessage('다시 로그인해주세요');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  navigate('/login');
                }
            }
        } else {
            setMessage('Failed to delete favorite books.');
        }
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

        return response.data;
    } catch (error) {
        console.error("Error fetching recommended books:", error.response?.data || error.message);

        if (error.response && error.response.status == 401) {
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
      
                const retryResponse = await axios.get(`${API_BASE_URL}/recommendations`, {
                    headers: {
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });

                console.log('retry response : ', retryResponse);
      
                return retryResponse.data;
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError.response);
      
                if(refreshError.response?.status === 403) {
                  setMessage('다시 로그인해주세요');
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  navigate('/login');
                }
            }
        } else {
            setMessage('Failed to call recommended books.');
        }
    }
};
