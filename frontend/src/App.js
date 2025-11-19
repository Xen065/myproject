import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Study from './pages/Study';
import AdminDashboard from './pages/admin/AdminDashboard';
import Permissions from './pages/admin/Permissions';
import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AdminProvider>
            <div className="App">
              <Navigation />
              <main className="main-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses"
                    element={
                      <ProtectedRoute>
                        <Courses />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/courses/:id"
                    element={
                      <ProtectedRoute>
                        <CourseDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study"
                    element={
                      <ProtectedRoute>
                        <Study />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/permissions"
                    element={
                      <ProtectedRoute>
                        <Permissions />
                      </ProtectedRoute>
                    }
                  />

                  {/* Default route */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </AdminProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
