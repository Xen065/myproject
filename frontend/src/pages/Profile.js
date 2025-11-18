/**
 * ============================================
 * Profile Page
 * ============================================
 * User profile, achievements, and statistics
 */

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { achievementsAPI, statsAPI } from '../services/api';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [achievementsResponse, statsResponse] = await Promise.all([
        achievementsAPI.getAll(),
        statsAPI.getDashboard()
      ]);

      setAchievements(achievementsResponse.data.achievements || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading profile...</div>
      </>
    );
  }

  const getRarityClass = (rarity) => {
    return `rarity-${rarity}`;
  };

  return (
    <>
      <Navigation />
      <div className="profile-container">
        {/* User Info Card */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.avatar || '👤'}
          </div>
          <div className="profile-info">
            <h1>{user?.fullName || user?.username}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-label">Level</span>
                <span className="stat-value">{stats?.user?.level || 1}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">XP</span>
                <span className="stat-value">{stats?.user?.xp || 0}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Coins</span>
                <span className="stat-value">{stats?.user?.coins || 0}</span>
              </div>
              <div className="profile-stat">
                <span className="stat-label">Streak</span>
                <span className="stat-value">🔥 {stats?.user?.streak || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="profile-section">
          <h2>📊 Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🎴</div>
              <div className="stat-details">
                <div className="stat-number">{stats?.cards?.total || 0}</div>
                <div className="stat-label">Total Cards</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">✅</div>
              <div className="stat-details">
                <div className="stat-number">{stats?.cards?.mastered || 0}</div>
                <div className="stat-label">Mastered</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-details">
                <div className="stat-number">{stats?.performance?.accuracy || 0}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">📚</div>
              <div className="stat-details">
                <div className="stat-number">{stats?.courses?.enrolled || 0}</div>
                <div className="stat-label">Courses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="profile-section">
          <h2>🏆 Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => {
              const unlocked = achievement.userProgress?.unlocked;
              return (
                <div
                  key={achievement.id}
                  className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} ${getRarityClass(achievement.rarity)}`}
                >
                  <div className="achievement-icon">
                    {unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className="achievement-content">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <div className="achievement-rewards">
                      <span>+{achievement.xpReward} XP</span>
                      <span>+{achievement.coinReward} coins</span>
                    </div>
                    {!unlocked && achievement.requirementText && (
                      <div className="achievement-requirement">
                        {achievement.requirementText}
                      </div>
                    )}
                  </div>
                  <div className={`rarity-badge ${achievement.rarity}`}>
                    {achievement.rarity}
                  </div>
                </div>
              );
            })}
          </div>

          {achievements.length === 0 && (
            <div className="empty-state">
              <p>No achievements yet. Start studying to unlock them!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
