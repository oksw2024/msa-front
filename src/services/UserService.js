
import apiClient from './AxiosInstance';



const USER_API = '/v1/user';

export const findUser = async () => {
  try {
    const response = await apiClient.get(USER_API);
    console.log('User data fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in findUser:', error.response || error.message);
    throw error;
  }
};


export const updateUser = async (userDetails) => {
  const response = await apiClient.put(USER_API, userDetails);
  return response.data;
};

export const deleteUser = async () => {
  const response = await apiClient.delete(USER_API);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    return await apiClient.post('/v1/user/change-password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw error;
  }
};


