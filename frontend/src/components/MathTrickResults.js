import React, { useState } from 'react';
import './MathTrick.css';

function MathTrickResults({ score, correctCount, wrongCount, maxStreak, questionResults, progress, onPlayAgain, onClose }) {
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = correctCount + wrongCount;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgTime = questionResults.length > 0
    ? Math.round(questionResults.reduce((sum, q) => sum + q.timeTaken, 0) / questionResults.length)
    : 0;

  // Calculate performance grade
  let grade = 'C';
  let gradeColor = '#95a5a6';
  let gradeIcon = '😐';

  if (accuracy >= 90 && avgTime <= 20) {
    grade = 'S';
    gradeColor = '#f39c12';
    gradeIcon = '🏆';
  } else if (accuracy >= 80) {
    grade = 'A';
    gradeColor = '#2ecc71';
    gradeIcon = '🌟';
  } else if (accuracy >= 70) {
    grade = 'B';
    gradeColor = '#3498db';
    gradeIcon = '👍';
  } else if (accuracy >= 50) {
    grade = 'C';
    gradeColor = '#e67e22';
    gradeIcon = '😐';
  } else {
    grade = 'D';
    gradeColor = '#e74c3c';
    gradeIcon = '😞';
  }

  return (
    <div className="mathtrick-overlay">
      <div className="mathtrick-modal results">
        <div className="mathtrick-header">
          <h1>Game Complete!</h1>
          <button className="mathtrick-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Grade Display */}
        <div className="mathtrick-grade" style={{ borderColor: gradeColor }}>
          <div className="grade-icon">{gradeIcon}</div>
          <div className="grade-letter" style={{ color: gradeColor }}>{grade}</div>
          <div className="grade-text">
            {grade === 'S' && 'Exceptional!'}
            {grade === 'A' && 'Excellent!'}
            {grade === 'B' && 'Good Job!'}
            {grade === 'C' && 'Keep Practicing!'}
            {grade === 'D' && 'Need Improvement'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mathtrick-results-stats">
          <div className="result-stat">
            <div className="stat-icon">💯</div>
            <div className="stat-info">
              <div className="stat-value">{score.toLocaleString()}</div>
              <div className="stat-label">Total Score</div>
            </div>
          </div>

          <div className="result-stat">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>

          <div className="result-stat">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{correctCount}/{totalQuestions}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
          </div>

          <div className="result-stat">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <div className="stat-value">{maxStreak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
          </div>

          <div className="result-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <div className="stat-value">{avgTime}s</div>
              <div className="stat-label">Avg Time</div>
            </div>
          </div>

          <div className="result-stat">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <div className="stat-value">Level {progress?.level || 1}</div>
              <div className="stat-label">Current Level</div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {progress && (
          <div className="mathtrick-xp-progress">
            <div className="xp-label">
              <span>XP: {progress.xp}</span>
              <span>Next Level: {[0, 1000, 3000, 6000, 10000, 15000][progress.level] || 'MAX'}</span>
            </div>
            <div className="xp-bar-container">
              <div
                className="xp-bar-fill"
                style={{
                  width: `${Math.min(100, (progress.xp / ([0, 1000, 3000, 6000, 10000, 15000][progress.level] || progress.xp)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Review Toggle */}
        <button
          className="mathtrick-review-toggle"
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? '▲ Hide Review' : '▼ Review Answers'}
        </button>

        {/* Question Review */}
        {showReview && (
          <div className="mathtrick-review-section">
            {questionResults.map((result, index) => (
              <div key={index} className={`review-item ${result.isCorrect ? 'correct' : 'wrong'}`}>
                <div className="review-header">
                  <span className="review-number">Q{index + 1}</span>
                  <span className="review-status">{result.isCorrect ? '✅' : '❌'}</span>
                  <span className="review-time">⏱️ {result.timeTaken}s</span>
                  {result.isCorrect && <span className="review-points">+{result.points}</span>}
                </div>
                <div className="review-question">{result.question}</div>
                <div className="review-answers">
                  <div className="review-answer">
                    <span className="answer-label">Your Answer:</span>
                    <span className={result.isCorrect ? 'answer-correct' : 'answer-wrong'}>
                      {result.userAnswer}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="review-answer">
                      <span className="answer-label">Correct Answer:</span>
                      <span className="answer-correct">{result.correctAnswer}</span>
                    </div>
                  )}
                </div>
                {result.trick && (
                  <div className="review-trick">
                    <strong>💡 Trick:</strong> {result.trick}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mathtrick-results-actions">
          <button className="mathtrick-btn primary" onClick={onPlayAgain}>
            🎮 Play Again
          </button>
          <button className="mathtrick-btn secondary" onClick={onClose}>
            🏠 Back to Study
          </button>
        </div>
      </div>
    </div>
  );
}

export default MathTrickResults;
