import React from 'react';
import { Link } from 'react-router-dom';
import "../css/Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-links">
                    <Link to="/terms" className="footer-link">이용약관</Link>
                    <Link to="/privacy" className="footer-link">개인정보처리방침</Link>
                    <Link to="/about" className="footer-link">사이트소개</Link>
                </div>
                <div className="footer-info">
                    <p>© 2024 Seoul library integrated search service.</p>
                    <p>서울특별시 성북구 서경로 124 | 고객센터: 123-45-67890</p>
                </div>
            </div>
        </footer>
    );
}