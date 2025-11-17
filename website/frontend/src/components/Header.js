import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Chip } from '@mui/material';
import { Notifications, Settings, LocalFireDepartment } from '@mui/icons-material';

function Header({ userStats }) {
  if (!userStats) return null;

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          EduMaster
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            icon={<LocalFireDepartment sx={{ color: '#FF6B6B !important' }} />}
            label={`${userStats.currentStreak} days`}
            sx={{ fontWeight: 600, backgroundColor: '#FFF5F5' }}
          />
          <Chip
            label={`Level ${userStats.level}`}
            sx={{ fontWeight: 600, backgroundColor: '#EEF2FF', color: '#6366F1' }}
          />
          <Chip
            label={`${userStats.coins} coins`}
            sx={{ fontWeight: 600, backgroundColor: '#FEF3C7', color: '#F59E0B' }}
          />
          <IconButton size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <Notifications />
          </IconButton>
          <IconButton size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
