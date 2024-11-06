// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { findUser, updateUser } from '../services/UserService';
import { useNavigate } from 'react-router-dom';

export default function UserComponent() {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/');
  }

  const handleFindUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      const response = await findUser(accessToken);
      setUserData(response);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage('Failed to fetch user data.');
    }
  };

  const handleUpdateUser = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage('No access token found.');
      return;
    }
    try {
      await updateUser(accessToken, { username });
      setMessage('User updated successfully.');
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage('Failed to update user.');
    }
  };

  return (
    <div>
      <h2>로그인 성공</h2>
      <button onClick={handleFindUser}>사용자 정보</button>
      {userData && (
        <div>
          <h3>사용자 정보</h3>
          <p><strong>이름:</strong> {userData.username}</p>
          <p><strong>이메일:</strong> {userData.email}</p>
        </div>
      )}
      <input
        type="text"
        placeholder="New Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleUpdateUser}>정보 수정</button>
      <button onClick={handleBack}>뒤로가기</button>
      {message && <p>{message}</p>}
    </div>
  );
}