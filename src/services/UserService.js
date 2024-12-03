
import apiClient from './AxiosInstance';

const USER_API = '/v1/user';

export const findUser = async () => {
  const response = await apiClient.get(USER_API);
  return response.data;
};

export const updateUser = async (userDetails) => {
  const response = await apiClient.put(USER_API, userDetails);
  return response.data;
};

export const deleteUser = async () => {
  const response = await apiClient.delete(USER_API);
  return response.data;
};


