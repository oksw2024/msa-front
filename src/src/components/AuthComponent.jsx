import React, { useState } from 'react';
import { login, signup, refreshToken } from '../services/AuthService';

export default function AuthComponent() {
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await login({ username, password });
      setMessage(`Login successful! Token: ${response.accessToken}`);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    } catch (error) {
      setMessage('Login failed.');
    }
  };

  const handleSignup = async () => {
    try {
      await signup({ username, contact, password, email });
      setMessage('Signup successful! You can now log in.');
    } catch (error) {
      setMessage('Signup failed.');
    }
  };

  const handleRefreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      setMessage('No refresh token found.');
      return;
    }
    try {
      const newAccessToken = await refreshToken(refreshTokenValue);
      setMessage(`Token refreshed! New Access Token: ${newAccessToken}`);
      localStorage.setItem('accessToken', newAccessToken);
    } catch (error) {
      setMessage('Token refresh failed.');
    }
  };

  return (
    <div>
      <h2>Auth Component</h2>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="아이디"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>
      <button onClick={handleRefreshToken}>Refresh Token</button>
      {message && <p>{message}</p>}
    </div>
  );
}