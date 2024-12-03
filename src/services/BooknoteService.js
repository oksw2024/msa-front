import apiClient from './AxiosInstance';

export const fetchBooks = async () => {
    try {
        const response = await apiClient.get('/books/get');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch books:', error);
        throw error;
    }
};

export const addBook = async (newBook) => {
    try {
        const response = await apiClient.post('/books/add', newBook);
        return response.data;
    } catch (error) {
        console.error('Failed to add book:', error);
        throw error;
    }
};
