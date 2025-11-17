import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Alert,
  Snackbar
} from '@mui/material';
import { Star, ShoppingCart, CheckCircle } from '@mui/icons-material';
import { getAllCourses, purchaseCourse, getUserStats } from '../api';

function Store({ refreshStats }) {
  const [courses, setCourses] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesResponse, statsResponse] = await Promise.all([
        getAllCourses(),
        getUserStats()
      ]);
      setCourses(coursesResponse.data);
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  };

  const handlePurchase = async (courseId) => {
    try {
      const response = await purchaseCourse(courseId);
      if (response.data.success) {
        setNotification({ type: 'success', message: 'Course purchased successfully!' });
        fetchData();
        refreshStats();
      } else {
        setNotification({ type: 'error', message: response.data.message });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to purchase course' });
    }
  };

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const filteredCourses = selectedCategory === 'All'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const CourseCard = ({ course }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 36, mr: 2 }}>
            {course.icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {course.name}
            </Typography>
            <Chip
              size="small"
              label={course.category}
              sx={{ backgroundColor: '#EEF2FF', color: '#6366F1', mb: 1 }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Star sx={{ color: '#F59E0B', fontSize: 20 }} />
            <Typography variant="body2" fontWeight={600}>
              {course.rating}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {course.totalCards} cards
          </Typography>
        </Box>

        {course.isOwned ? (
          <Button
            fullWidth
            variant="contained"
            disabled
            startIcon={<CheckCircle />}
          >
            Owned
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => handlePurchase(course.id)}
            disabled={userStats && userStats.coins < course.price}
          >
            {course.price} Coins
          </Button>
        )}

        {userStats && !course.isOwned && userStats.coins < course.price && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            Insufficient coins
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Course Store
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and purchase courses to expand your learning
        </Typography>
      </Box>

      {/* User Coins */}
      {userStats && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have <strong>{userStats.coins} coins</strong> available
        </Alert>
      )}

      {/* Category Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => setSelectedCategory(category)}
            color={selectedCategory === category ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Courses Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No courses found in this category
          </Typography>
        </Box>
      )}

      {/* Notification */}
      <Snackbar
        open={notification !== null}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.type}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}

export default Store;
