import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  LocalFireDepartment,
  EmojiEvents,
  TrendingUp,
  Timer,
  Lock,
  CheckCircle
} from '@mui/icons-material';
import { getAllAchievements } from '../api';

function Profile({ userStats }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await getAllAchievements();
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  if (!userStats) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  const xpNeeded = userStats.level * 100;
  const xpProgress = (userStats.experiencePoints / xpNeeded) * 100;

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor
            }}
          >
            <Icon sx={{ color, fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const AchievementCard = ({ achievement }) => {
    const progress = achievement.maxProgress > 0
      ? (achievement.progress / achievement.maxProgress) * 100
      : 0;

    return (
      <Card
        sx={{
          opacity: achievement.isUnlocked ? 1 : 0.6,
          border: achievement.isUnlocked ? 2 : 0,
          borderColor: 'success.main'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                fontSize: 32,
                backgroundColor: achievement.isUnlocked ? '#D1FAE5' : '#F3F4F6'
              }}
            >
              {achievement.isUnlocked ? achievement.icon : '🔒'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" fontWeight={600}>
                  {achievement.name}
                </Typography>
                {achievement.isUnlocked && (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {achievement.description}
              </Typography>
            </Box>
          </Box>

          {!achievement.isUnlocked && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {achievement.progress}/{achievement.maxProgress}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {achievement.isUnlocked && (
            <Chip
              size="small"
              label="Unlocked"
              color="success"
              sx={{ mt: 1 }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Profile
      </Typography>

      {/* User Info Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: 'white' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: 40,
                backgroundColor: 'rgba(255,255,255,0.2)'
              }}
            >
              👤
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                John Doe
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Level ${userStats.level}`}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
                <Chip
                  label={`${userStats.coins} Coins`}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
                <Chip
                  icon={<LocalFireDepartment sx={{ color: 'white !important' }} />}
                  label={`${userStats.currentStreak} Day Streak`}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Level Progress */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Level {userStats.level} Progress
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: 'white' }}>
                {userStats.experiencePoints} / {xpNeeded} XP
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={xpProgress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={EmojiEvents}
            label="Cards Studied"
            value={userStats.totalCardsStudied}
            color="#F59E0B"
            bgColor="#FEF3C7"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={Timer}
            label="Study Minutes"
            value={userStats.totalStudyMinutes}
            color="#8B5CF6"
            bgColor="#EDE9FE"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={TrendingUp}
            label="Accuracy"
            value={`${userStats.averageAccuracy}%`}
            color="#10B981"
            bgColor="#D1FAE5"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={LocalFireDepartment}
            label="Longest Streak"
            value={`${userStats.longestStreak} days`}
            color="#FF6B6B"
            bgColor="#FFF5F5"
          />
        </Grid>
      </Grid>

      {/* Achievements */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Achievements
            </Typography>
            <Chip
              label={`${unlockedAchievements.length}/${achievements.length}`}
              color="primary"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Unlock achievements by studying consistently and reaching milestones
          </Typography>

          {unlockedAchievements.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'success.main' }} />
                Unlocked ({unlockedAchievements.length})
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {unlockedAchievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <AchievementCard achievement={achievement} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {lockedAchievements.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock sx={{ color: 'text.secondary' }} />
                Locked ({lockedAchievements.length})
              </Typography>
              <Grid container spacing={2}>
                {lockedAchievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <AchievementCard achievement={achievement} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile;
