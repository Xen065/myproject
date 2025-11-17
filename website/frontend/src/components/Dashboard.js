import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Avatar
} from '@mui/material';
import {
  LocalFireDepartment,
  Assignment,
  CheckCircle,
  FiberNew,
  AccessTime,
  ArrowForward,
  Star
} from '@mui/icons-material';
import { getDashboardStats, getOwnedCourses } from '../api';

function Dashboard({ refreshStats }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, coursesResponse] = await Promise.all([
        getDashboardStats(),
        getOwnedCourses()
      ]);
      setStats(statsResponse.data);
      setCourses(coursesResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (!stats) {
    return <Box sx={{ p: 3 }}>Error loading data</Box>;
  }

  const todayProgress = stats.dueToday > 0
    ? Math.round((stats.dueToday - stats.dueToday) / stats.dueToday * 100)
    : 0;

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const CourseCard = ({ course }) => {
    const progress = course.totalCards > 0
      ? Math.round((course.cardsCompleted / course.totalCards) * 100)
      : 0;

    return (
      <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, fontSize: 32, mr: 2 }}>
              {course.icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {course.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  size="small"
                  label={course.category}
                  sx={{ backgroundColor: '#EEF2FF', color: '#6366F1' }}
                />
                {course.cardsDue > 0 && (
                  <Chip
                    size="small"
                    label={`${course.cardsDue} due`}
                    color="error"
                  />
                )}
                <Chip
                  size="small"
                  icon={<Star sx={{ fontSize: 16 }} />}
                  label={course.rating}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {course.cardsCompleted}/{course.totalCards}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            endIcon={<ArrowForward />}
            onClick={() => navigate(`/study/${course.id}`)}
            disabled={course.cardsDue === 0}
          >
            {course.cardsDue > 0 ? 'Study Now' : 'All Caught Up'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Streak Card */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)',
          color: 'white'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalFireDepartment sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {stats.streak} Day Streak!
              </Typography>
              <Typography variant="body1">
                Keep the fire burning! Study today to maintain your streak.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={Assignment}
            label="Due Today"
            value={stats.dueToday}
            color="#EF4444"
            bgColor="#FEE2E2"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            color="#10B981"
            bgColor="#D1FAE5"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={FiberNew}
            label="New Cards"
            value={stats.newCards}
            color="#3B82F6"
            bgColor="#DBEAFE"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={AccessTime}
            label="Study Time"
            value={`${stats.studyTime}m`}
            color="#8B5CF6"
            bgColor="#EDE9FE"
          />
        </Grid>
      </Grid>

      {/* Today's Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Today's Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={todayProgress}
              sx={{ flexGrow: 1, height: 12, borderRadius: 6 }}
            />
            <Typography variant="h6" fontWeight={700}>
              {todayProgress}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Active Courses */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            Your Courses
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/store')}
          >
            Browse More
          </Button>
        </Box>

        {courses.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No courses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Visit the store to purchase your first course
              </Typography>
              <Button variant="contained" onClick={() => navigate('/store')}>
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
