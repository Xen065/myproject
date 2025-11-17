import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Dashboard,
  Book,
  CalendarMonth,
  Store as StoreIcon,
  Person
} from '@mui/icons-material';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getPathValue = () => {
    if (location.pathname === '/') return 0;
    if (location.pathname.startsWith('/study')) return 1;
    if (location.pathname === '/calendar') return 2;
    if (location.pathname === '/store') return 3;
    if (location.pathname === '/profile') return 4;
    return 0;
  };

  const handleNavigation = (event, newValue) => {
    switch (newValue) {
      case 0: navigate('/'); break;
      case 1: navigate('/study'); break;
      case 2: navigate('/calendar'); break;
      case 3: navigate('/store'); break;
      case 4: navigate('/profile'); break;
      default: break;
    }
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation
        value={getPathValue()}
        onChange={handleNavigation}
        showLabels
      >
        <BottomNavigationAction label="Dashboard" icon={<Dashboard />} />
        <BottomNavigationAction label="Study" icon={<Book />} />
        <BottomNavigationAction label="Calendar" icon={<CalendarMonth />} />
        <BottomNavigationAction label="Store" icon={<StoreIcon />} />
        <BottomNavigationAction label="Profile" icon={<Person />} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
