import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Study from './components/Study';
import Calendar from './components/Calendar';
import Store from './components/Store';
import Profile from './components/Profile';

// API
import { getUserStats } from './api';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1',
    },
    secondary: {
      main: '#8B5CF6',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#3B82F6',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await getUserStats();
      setUserStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setLoading(false);
    }
  };

  const refreshUserStats = () => {
    fetchUserStats();
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          Loading...
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: 'background.default'
          }}
        >
          <Header userStats={userStats} />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              pb: 8,
              pt: 2,
              maxWidth: '1200px',
              width: '100%',
              margin: '0 auto',
              px: { xs: 2, sm: 3, md: 4 }
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard refreshStats={refreshUserStats} />} />
              <Route path="/study/:courseId?" element={<Study refreshStats={refreshUserStats} />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/store" element={<Store refreshStats={refreshUserStats} />} />
              <Route path="/profile" element={<Profile userStats={userStats} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>

          <BottomNav />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
