//AxiosInstance.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

// 요청 인터셉터: Access Token 추가
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        //console.log('accessToken : ', accessToken);
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 Unauthorized 처리
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Refresh token is missing');
                }

                const refreshResponse = await axios.get(`${API_BASE_URL}/v1/auth/refresh`, {
                    headers: { REFRESH_TOKEN: refreshToken },
                });

                //console.log('refreshToken : ', refreshToken);

                const newAccessToken = refreshResponse.data;
                localStorage.setItem('accessToken', newAccessToken);

                //console.log('New accessToken : ', newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                if (refreshError.response?.status === 403) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
