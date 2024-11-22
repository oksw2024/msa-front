import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import UserComponent from './components/UserComponent';
import LoginComponent from './components/LoginComponent';
import SignupComponent from './components/SignupComponent';
import BookSearchComponent from './components/BookSearchComponent';
import './App.css';
import PlusBookComponent from './components/PlusBookComponent';
import BookDetailComponent from './components/BookDetailComponent';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const LoginStatus = localStorage.getItem('isLoggedIn');
    if (LoginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<MainScreen isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
        />
        <Route
          path="/login"
          element={<LoginComponent onLogin={handleLogin} />}
        />
        <Route path="/signup" element={<SignupComponent />} />
        <Route
          path="/user"
          element={<UserComponent />}
        />
        <Route path="/book/list" element={<BookSearchComponent />} />
        <Route path="/book/plus" element={<PlusBookComponent />} />
        <Route path="/book/details" element={<BookDetailComponent />} />
      </Routes>
    </Router>
  );
}

export default App;