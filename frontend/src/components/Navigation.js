/**
 * ============================================
 * Navigation Component
 * ============================================
 * Top navigation bar with links and user menu
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/dashboard">🎓 EduMaster</Link>
        </div>

        <div className="nav-links">
          <Link to="/dashboard" className={isActive('/dashboard')}>
            Dashboard
          </Link>
          <Link to="/study" className={isActive('/study')}>
            Study
          </Link>
          <Link to="/courses" className={isActive('/courses')}>
            Courses
          </Link>
          <Link to="/profile" className={isActive('/profile')}>
            Profile
          </Link>
        </div>

        <div className="nav-user">
          <span className="user-info">
            {user?.fullName || user?.username}
            <span className="user-level">Lv. {user?.level || 1}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
