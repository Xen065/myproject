import React, { useState, useEffect } from 'react';
import { mathTrickAPI } from '../services/api';
import './MathTrick.css';

function MathTrickLeaderboard({ onBack, onClose }) {
  const [period, setPeriod] = useState('all-time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await mathTrickAPI.getLeaderboard(period, 100);

      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard);
        setUserRank(response.data.data.userRank);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="mathtrick-overlay">
      <div className="mathtrick-modal leaderboard">
        <div className="mathtrick-header">
          <button className="mathtrick-back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>🏆 Leaderboard</h1>
          <button className="mathtrick-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Period Selector */}
        <div className="leaderboard-period-selector">
          <button
            className={`period-btn ${period === 'daily' ? 'active' : ''}`}
            onClick={() => setPeriod('daily')}
          >
            📅 Daily
          </button>
          <button
            className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            📊 Weekly
          </button>
          <button
            className={`period-btn ${period === 'all-time' ? 'active' : ''}`}
            onClick={() => setPeriod('all-time')}
          >
            🌟 All Time
          </button>
        </div>

        {/* User Rank Card */}
        {userRank && (
          <div className="leaderboard-user-rank">
            <div className="user-rank-info">
              <span className="rank-badge">{getRankIcon(userRank)}</span>
              <span className="rank-text">Your Rank</span>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="leaderboard-list">
          {loading ? (
            <div className="loading-message">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-message">No data available yet. Be the first!</div>
          ) : (
            leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.student?.id === currentUser.id;

              return (
                <div
                  key={entry.id}
                  className={`leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${rank <= 3 ? 'top-three' : ''}`}
                >
                  <div className="leaderboard-rank">
                    {getRankIcon(rank)}
                  </div>
                  <div className="leaderboard-user">
                    <div className="user-name">
                      {entry.student?.username || 'Unknown'}
                      {isCurrentUser && <span className="you-badge">YOU</span>}
                    </div>
                    <div className="user-stats">
                      Level {entry.level} • {entry.totalQuestionsAnswered} questions
                    </div>
                  </div>
                  <div className="leaderboard-score">
                    <div className="score-value">{entry.totalScore.toLocaleString()}</div>
                    <div className="score-label">points</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default MathTrickLeaderboard;
