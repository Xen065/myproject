import React, { useState, useEffect } from 'react';
import { mathTrickAPI } from '../services/api';
import MathTrickNumpad from './MathTrickNumpad';
import MathTrickResults from './MathTrickResults';
import MathTrickLeaderboard from './MathTrickLeaderboard';
import MathTrickAnalytics from './MathTrickAnalytics';
import './MathTrick.css';

const TOPICS = [
  { id: 'speedArithmetic', name: '⚡ Speed Arithmetic', icon: '➕', desc: 'Quick calculations' },
  { id: 'mentalMath', name: '🧠 Mental Math', icon: '🎯', desc: 'Vedic tricks' },
  { id: 'percentage', name: '💯 Percentage', icon: '%', desc: 'Quick percentages' },
  { id: 'profitLoss', name: '💰 Profit & Loss', icon: '📈', desc: 'Business math' },
  { id: 'squaresCubes', name: '🔢 Squares & Cubes', icon: '²', desc: 'Powers & roots' },
  { id: 'ratio', name: '⚖️ Ratio & Proportion', icon: '⚖', desc: 'Ratios' },
  { id: 'simplification', name: '🧮 Simplification', icon: '( )', desc: 'BODMAS' },
  { id: 'timeWork', name: '⏰ Time & Work', icon: '👷', desc: 'Work problems' },
  { id: 'speedDistance', name: '🚄 Speed & Distance', icon: '🏃', desc: 'Motion problems' },
  { id: 'numberSeries', name: '🔢 Number Series', icon: '...', desc: 'Pattern finding' }
];

const GAME_MODES = [
  { id: 'speed_challenge', name: 'Speed Challenge', icon: '⚡', desc: 'Time-limited questions', color: '#ff6b6b' },
  { id: 'daily_practice', name: 'Daily Practice', icon: '📅', desc: '10 questions per day', color: '#4ecdc4' },
  { id: 'endless', name: 'Endless Mode', icon: '♾️', desc: 'Keep going!', color: '#95e1d3' },
  { id: 'competitive_simulation', name: 'Competitive Exam', icon: '🏆', desc: 'Real exam format', color: '#f38181' }
];

function MathTrick({ onClose }) {
  const [view, setView] = useState('menu'); // menu, topic-select, game, results, leaderboard, analytics
  const [progress, setProgress] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [lives, setLives] = useState(3);
  const [showTrick, setShowTrick] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user progress on mount
  useEffect(() => {
    fetchProgress();
  }, []);

  // Timer for current question
  useEffect(() => {
    if (view === 'game' && questionStartTime) {
      const interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - questionStartTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [view, questionStartTime]);

  const fetchProgress = async () => {
    try {
      const response = await mathTrickAPI.getProgress();
      if (response.data.success) {
        setProgress(response.data.data.progress);
        setSelectedLevel(response.data.data.progress.level);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setView('topic-select');
  };

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    await startGame(topic);
  };

  const startGame = async (topic) => {
    try {
      setLoading(true);

      // Determine question count based on mode
      let questionCount = 20;
      if (selectedMode.id === 'daily_practice') questionCount = 10;
      if (selectedMode.id === 'competitive_simulation') questionCount = 25;

      // Fetch questions
      const response = await mathTrickAPI.getQuestions(topic.id, selectedLevel, questionCount);

      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setCorrectCount(0);
        setWrongCount(0);
        setQuestionResults([]);
        setLives(3);
        setUserAnswer('');
        setGameStartTime(Date.now());
        setQuestionStartTime(Date.now());
        setTimer(0);
        setView('game');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNumpadInput = (value) => {
    let newAnswer = userAnswer;

    if (value === 'clear') {
      setUserAnswer('');
      return;
    } else if (value === 'backspace') {
      setUserAnswer(userAnswer.slice(0, -1));
      return;
    } else {
      newAnswer = userAnswer + value;
      setUserAnswer(newAnswer);
    }

    // Auto-validate when answer is entered
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer.toString();
    const tolerance = 0.01; // Allow small decimal differences

    // Check if exact match
    if (newAnswer === correctAnswer || Math.abs(parseFloat(newAnswer) - parseFloat(correctAnswer)) < tolerance) {
      handleCorrectAnswer(newAnswer);
    } else if (newAnswer.length > correctAnswer.length + 2) {
      // Answer is too long and wrong
      handleWrongAnswer(newAnswer);
    }
  };

  const handleCorrectAnswer = (answer) => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQuestion = questions[currentQuestionIndex];

    // Calculate points
    const basePoints = selectedLevel * 100;
    let speedMultiplier = 1;

    if (timeTaken <= 10) speedMultiplier = 3;
    else if (timeTaken <= 20) speedMultiplier = 2;
    else if (timeTaken <= 30) speedMultiplier = 1.5;
    else if (timeTaken <= 45) speedMultiplier = 1;
    else speedMultiplier = 0.5;

    const streakMultiplier = streak >= 10 ? 2 : streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1;
    const points = Math.floor(basePoints * speedMultiplier * streakMultiplier) + 50;

    // Update state
    const newStreak = streak + 1;
    setScore(score + points);
    setStreak(newStreak);
    setMaxStreak(Math.max(maxStreak, newStreak));
    setCorrectCount(correctCount + 1);

    // Show celebration
    let celebrationMsg = '✅ Correct!';
    if (timeTaken <= 10) celebrationMsg = '⚡ Lightning Fast!';
    else if (timeTaken <= 20) celebrationMsg = '🔥 Great Speed!';
    if (newStreak >= 10) celebrationMsg += ' 🔥 STREAK x' + newStreak;

    setCelebration({ type: 'correct', message: celebrationMsg, points: `+${points}` });

    // Save result
    setQuestionResults([...questionResults, {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.answer,
      timeTaken,
      points,
      isCorrect: true,
      trick: currentQuestion.trick
    }]);

    // Move to next question after delay
    setTimeout(() => {
      setCelebration(null);
      moveToNextQuestion();
    }, 1000);
  };

  const handleWrongAnswer = (answer) => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQuestion = questions[currentQuestionIndex];

    // Update state
    setStreak(0);
    setWrongCount(wrongCount + 1);
    setLives(lives - 1);

    // Show error
    setCelebration({ type: 'wrong', message: '❌ Wrong!', points: '' });

    // Save result
    setQuestionResults([...questionResults, {
      question: currentQuestion.question,
      userAnswer: answer,
      correctAnswer: currentQuestion.answer,
      timeTaken,
      points: 0,
      isCorrect: false,
      trick: currentQuestion.trick
    }]);

    // Check game over
    if (lives - 1 <= 0 && selectedMode.id === 'speed_challenge') {
      setTimeout(() => {
        endGame();
      }, 1500);
      return;
    }

    // Move to next question after delay
    setTimeout(() => {
      setCelebration(null);
      setUserAnswer('');
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    setUserAnswer('');
    setShowTrick(false);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
      setTimer(0);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    const totalTime = Math.floor((Date.now() - gameStartTime) / 1000);

    try {
      // Submit game to backend
      const gameData = {
        gameMode: selectedMode.id,
        topic: selectedTopic.id,
        level: selectedLevel,
        score,
        questionsAnswered: correctCount + wrongCount,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        totalTime,
        maxStreak,
        questionResults
      };

      const response = await mathTrickAPI.submitGame(gameData);

      if (response.data.success) {
        setProgress(response.data.data.progress);
      }
    } catch (error) {
      console.error('Error submitting game:', error);
    }

    setView('results');
  };

  const handlePlayAgain = () => {
    setView('menu');
    setSelectedMode(null);
    setSelectedTopic(null);
  };

  // RENDER: Loading
  if (loading && view === 'menu') {
    return (
      <div className="mathtrick-overlay">
        <div className="mathtrick-modal loading">
          <p>Loading Math Trick...</p>
        </div>
      </div>
    );
  }

  // RENDER: Results
  if (view === 'results') {
    return (
      <MathTrickResults
        score={score}
        correctCount={correctCount}
        wrongCount={wrongCount}
        maxStreak={maxStreak}
        questionResults={questionResults}
        progress={progress}
        onPlayAgain={handlePlayAgain}
        onClose={onClose}
      />
    );
  }

  // RENDER: Leaderboard
  if (view === 'leaderboard') {
    return (
      <MathTrickLeaderboard
        onBack={() => setView('menu')}
        onClose={onClose}
      />
    );
  }

  // RENDER: Analytics
  if (view === 'analytics') {
    return (
      <MathTrickAnalytics
        progress={progress}
        onBack={() => setView('menu')}
        onClose={onClose}
      />
    );
  }

  // RENDER: Game
  if (view === 'game') {
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Time limit per question based on level
    const timeLimit = [60, 45, 30, 20, 15][selectedLevel - 1];
    const timeWarning = timer > timeLimit * 0.7;
    const timeOver = timer > timeLimit;

    return (
      <div className="mathtrick-overlay">
        <div className="mathtrick-modal game">
          {/* Header */}
          <div className="mathtrick-game-header">
            <button className="mathtrick-close-btn" onClick={onClose}>×</button>
            <div className="mathtrick-game-stats">
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{'⭐'.repeat(selectedLevel)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Streak</span>
                <span className="stat-value">{streak > 0 ? `🔥 ${streak}` : '—'}</span>
              </div>
              {selectedMode.id === 'speed_challenge' && (
                <div className="stat-item">
                  <span className="stat-label">Lives</span>
                  <span className="stat-value">{'❤️'.repeat(lives)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mathtrick-progress-container">
            <div className="mathtrick-progress-bar" style={{ width: `${progressPercent}%` }} />
            <span className="mathtrick-progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Question */}
          <div className="mathtrick-question-container">
            <div className={`mathtrick-timer ${timeWarning ? 'warning' : ''} ${timeOver ? 'over' : ''}`}>
              <span className="timer-icon">⏱️</span>
              <span className="timer-value">{timer}s</span>
            </div>

            <h2 className="mathtrick-question">{currentQuestion.question}</h2>

            {/* Answer Display */}
            <div className="mathtrick-answer-display">
              <span className="equals-sign">=</span>
              <input
                type="text"
                className="mathtrick-answer-input"
                value={userAnswer}
                readOnly
                placeholder="Type answer..."
              />
              {userAnswer && <span className="cursor-blink">|</span>}
            </div>

            {/* Celebration/Error Message */}
            {celebration && (
              <div className={`mathtrick-celebration ${celebration.type}`}>
                <div className="celebration-message">{celebration.message}</div>
                {celebration.points && <div className="celebration-points">{celebration.points}</div>}
              </div>
            )}

            {/* Trick Hint */}
            {showTrick && (
              <div className="mathtrick-hint">
                <strong>💡 Trick:</strong> {currentQuestion.trick}
              </div>
            )}

            {!celebration && (
              <button
                className="mathtrick-hint-btn"
                onClick={() => setShowTrick(!showTrick)}
              >
                {showTrick ? '🔒 Hide Trick' : '💡 Show Trick (-50 pts)'}
              </button>
            )}
          </div>

          {/* Numpad */}
          <MathTrickNumpad onInput={handleNumpadInput} disabled={!!celebration} />

          {/* Skip button */}
          {!celebration && (
            <button className="mathtrick-skip-btn" onClick={() => moveToNextQuestion()}>
              ⏭️ Skip Question
            </button>
          )}
        </div>
      </div>
    );
  }

  // RENDER: Topic Selection
  if (view === 'topic-select') {
    const unlockedTopics = progress?.unlockedTopics || [];

    return (
      <div className="mathtrick-overlay">
        <div className="mathtrick-modal topic-select">
          <div className="mathtrick-header">
            <button className="mathtrick-back-btn" onClick={() => setView('menu')}>
              ← Back
            </button>
            <h2>Select Topic</h2>
            <button className="mathtrick-close-btn" onClick={onClose}>×</button>
          </div>

          <div className="mathtrick-level-selector">
            <span>Difficulty:</span>
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                className={`level-btn ${selectedLevel === level ? 'active' : ''} ${level > (progress?.level || 1) ? 'locked' : ''}`}
                onClick={() => setSelectedLevel(level)}
                disabled={level > (progress?.level || 1)}
              >
                {'⭐'.repeat(level)}
              </button>
            ))}
          </div>

          <div className="mathtrick-topics-grid">
            {TOPICS.map(topic => {
              const isLocked = !unlockedTopics.includes(topic.id);
              return (
                <button
                  key={topic.id}
                  className={`mathtrick-topic-card ${isLocked ? 'locked' : ''}`}
                  onClick={() => !isLocked && handleTopicSelect(topic)}
                  disabled={isLocked}
                >
                  <div className="topic-icon">{topic.icon}</div>
                  <div className="topic-name">{topic.name}</div>
                  <div className="topic-desc">{topic.desc}</div>
                  {isLocked && <div className="lock-icon">🔒</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Main Menu
  return (
    <div className="mathtrick-overlay">
      <div className="mathtrick-modal menu">
        <div className="mathtrick-header">
          <h1>🧮 Math Trick</h1>
          <button className="mathtrick-close-btn" onClick={onClose}>×</button>
        </div>

        {/* User Progress Card */}
        {progress && (
          <div className="mathtrick-progress-card">
            <div className="progress-stat">
              <span className="progress-label">Level</span>
              <span className="progress-value">{'⭐'.repeat(progress.level)}</span>
            </div>
            <div className="progress-stat">
              <span className="progress-label">Total Score</span>
              <span className="progress-value">{progress.totalScore.toLocaleString()}</span>
            </div>
            <div className="progress-stat">
              <span className="progress-label">Accuracy</span>
              <span className="progress-value">
                {progress.totalQuestionsAnswered > 0
                  ? Math.round((progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100)
                  : 0}%
              </span>
            </div>
            <div className="progress-stat">
              <span className="progress-label">Best Streak</span>
              <span className="progress-value">🔥 {progress.longestStreak}</span>
            </div>
          </div>
        )}

        {/* Game Modes */}
        <div className="mathtrick-modes-section">
          <h3>Select Game Mode</h3>
          <div className="mathtrick-modes-grid">
            {GAME_MODES.map(mode => (
              <button
                key={mode.id}
                className="mathtrick-mode-card"
                style={{ borderColor: mode.color }}
                onClick={() => handleModeSelect(mode)}
              >
                <div className="mode-icon" style={{ color: mode.color }}>
                  {mode.icon}
                </div>
                <div className="mode-name">{mode.name}</div>
                <div className="mode-desc">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mathtrick-quick-links">
          <button className="quick-link-btn" onClick={() => setView('leaderboard')}>
            🏆 Leaderboard
          </button>
          <button className="quick-link-btn" onClick={() => setView('analytics')}>
            📊 Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export default MathTrick;
