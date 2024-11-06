import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1/user';

export const findUser = async (accessToken) => {
  const response = await axios.get(API_BASE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const updateUser = async (accessToken, userDetails) => {
  const response = await axios.put(API_BASE_URL, userDetails, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const deleteUser = async (accessToken) => {
  const response = await axios.delete(API_BASE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};