import React, { useState, useEffect } from 'react';
import { mathTrickAPI } from '../services/api';
import './MathTrick.css';

const TOPIC_NAMES = {
  speedArithmetic: 'Speed Arithmetic',
  mentalMath: 'Mental Math',
  percentage: 'Percentage',
  profitLoss: 'Profit & Loss',
  squaresCubes: 'Squares & Cubes',
  ratio: 'Ratio & Proportion',
  simplification: 'Simplification',
  timeWork: 'Time & Work',
  speedDistance: 'Speed & Distance',
  numberSeries: 'Number Series'
};

function MathTrickAnalytics({ progress, onBack, onClose }) {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, achievementsRes] = await Promise.all([
        mathTrickAPI.getStats(),
        mathTrickAPI.getAchievements()
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (achievementsRes.data.success) {
        setAchievements(achievementsRes.data.data.achievements);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mathtrick-overlay">
        <div className="mathtrick-modal analytics loading">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const topicStats = progress?.topicStats || {};

  return (
    <div className="mathtrick-overlay">
      <div className="mathtrick-modal analytics">
        <div className="mathtrick-header">
          <button className="mathtrick-back-btn" onClick={onBack}>
            ← Back
          </button>
          <h1>📊 Analytics</h1>
          <button className="mathtrick-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="analytics-content">
          {/* Overall Stats */}
          <div className="analytics-section">
            <h2>Overall Performance</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="card-icon">🎮</div>
                <div className="card-value">{stats?.totalGames || 0}</div>
                <div className="card-label">Total Games</div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">📝</div>
                <div className="card-value">{progress?.totalQuestionsAnswered || 0}</div>
                <div className="card-label">Questions Answered</div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🎯</div>
                <div className="card-value">{Math.round(stats?.avgAccuracy || 0)}%</div>
                <div className="card-label">Avg Accuracy</div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">⚡</div>
                <div className="card-value">{Math.round(progress?.averageSpeed || 0)}s</div>
                <div className="card-label">Avg Speed</div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">🔥</div>
                <div className="card-value">{progress?.longestStreak || 0}</div>
                <div className="card-label">Longest Streak</div>
              </div>
              <div className="analytics-card">
                <div className="card-icon">📅</div>
                <div className="card-value">{progress?.dailyStreak || 0}</div>
                <div className="card-label">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Topic-wise Performance */}
          <div className="analytics-section">
            <h2>Topic Performance</h2>
            <div className="topic-stats-list">
              {Object.keys(topicStats).map(topicKey => {
                const topic = topicStats[topicKey];
                const total = topic.correct + topic.wrong;
                const accuracy = total > 0 ? Math.round((topic.correct / total) * 100) : 0;

                if (total === 0) return null;

                return (
                  <div key={topicKey} className="topic-stat-item">
                    <div className="topic-stat-header">
                      <span className="topic-stat-name">{TOPIC_NAMES[topicKey] || topicKey}</span>
                      <span className="topic-stat-accuracy">{accuracy}%</span>
                    </div>
                    <div className="topic-stat-bar">
                      <div
                        className="topic-stat-fill"
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                    <div className="topic-stat-details">
                      <span>✅ {topic.correct} correct</span>
                      <span>❌ {topic.wrong} wrong</span>
                      <span>⏱️ {Math.round(topic.avgTime || 0)}s avg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="analytics-section">
            <h2>Achievements ({achievements.length})</h2>
            <div className="achievements-grid">
              {achievements.length === 0 ? (
                <div className="empty-message">No achievements yet. Keep playing!</div>
              ) : (
                achievements.map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">{achievement.badgeIcon}</div>
                    <div className="achievement-name">{achievement.badgeName}</div>
                    <div className="achievement-desc">{achievement.description}</div>
                    <div className="achievement-date">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Games */}
          <div className="analytics-section">
            <h2>Recent Games</h2>
            <div className="recent-games-list">
              {stats?.recentGames?.length === 0 ? (
                <div className="empty-message">No games played yet</div>
              ) : (
                stats?.recentGames?.map((game, index) => (
                  <div key={game.id} className="recent-game-item">
                    <div className="game-rank">#{index + 1}</div>
                    <div className="game-info">
                      <div className="game-mode">{game.gameMode.replace('_', ' ').toUpperCase()}</div>
                      <div className="game-details">
                        Level {game.level} • {game.questionsAnswered} questions • {game.accuracy.toFixed(0)}% accuracy
                      </div>
                    </div>
                    <div className="game-score">{game.score.toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MathTrickAnalytics;
