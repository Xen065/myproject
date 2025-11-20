import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAdmin } from '../contexts/AdminContext';
import './Navigation.css';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show nav on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          EduMaster
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Dashboard
              </Link>
              <Link
                to="/courses"
                className={location.pathname.startsWith('/courses') ? 'active' : ''}
              >
                Courses
              </Link>
              <Link
                to="/study"
                className={location.pathname === '/study' ? 'active' : ''}
              >
                Study
              </Link>
              <Link
                to="/study-tools"
                className={location.pathname === '/study-tools' ? 'active' : ''}
              >
                Study Tools
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={location.pathname.startsWith('/admin') ? 'active' : ''}
                >
                  Admin
                </Link>
              )}
              <button onClick={toggleTheme} className="btn-theme-toggle" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <div className="nav-user">
                <span className="user-name">{user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={toggleTheme} className="btn-theme-toggle" title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link to="/login" className="btn-nav-login">
                Login
              </Link>
              <Link to="/register" className="btn-nav-register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
