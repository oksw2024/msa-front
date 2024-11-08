import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/auth';

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/login`, credentials);
  return response.data;
};

export const signup = async (userDetails) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup`, userDetails);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export const refreshToken = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/refresh`, {
    headers: { REFRESH_TOKEN: token },
  });
  return response.data;
};