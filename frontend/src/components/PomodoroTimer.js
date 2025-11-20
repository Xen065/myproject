import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './PomodoroTimer.css';

const PomodoroTimer = ({ onClose, courseId, taskId, courses }) => {
  // Timer states
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro', 'custom', 'focus'
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [customDuration, setCustomDuration] = useState(30);

  // Session states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work', 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Focus mode states
  const [focusMode, setFocusMode] = useState(false);
  const [selectedAmbientSound, setSelectedAmbientSound] = useState(null);
  const [showBreakScreen, setShowBreakScreen] = useState(false);

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || '');
  const [selectedTaskId, setSelectedTaskId] = useState(taskId || '');
  const [sessionTitle, setSessionTitle] = useState('');
  const [showSettings, setShowSettings] = useState(!courseId && !taskId);

  // History & stats
  const [sessionHistory, setSessionHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const ambientSounds = [
    { id: 'rain', name: 'Rain', emoji: '🌧️' },
    { id: 'coffee', name: 'Coffee Shop', emoji: '☕' },
    { id: 'library', name: 'Library', emoji: '📚' },
    { id: 'nature', name: 'Nature', emoji: '🌿' },
    { id: 'white', name: 'White Noise', emoji: '🔊' }
  ];

  const motivationalQuotes = [
    "Great work! Take a breather.",
    "You're making excellent progress!",
    "Keep up the amazing effort!",
    "Every study session counts!",
    "You're one step closer to your goals!",
    "Consistency is key. Well done!",
    "Your hard work is paying off!",
    "Stay focused, stay strong!"
  ];

  // Load session history and stats on mount
  useEffect(() => {
    loadSessionHistory();
    loadStats('today');
    checkActiveSession();
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pomodoro/active', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.hasActiveSession) {
        const session = response.data.session;
        const timerData = response.data.timerData;

        // Resume session
        setSessionId(session.id);
        setTimerMode(timerData.timerMode || 'pomodoro');
        setWorkDuration(timerData.workDuration || 25);
        setBreakDuration(timerData.breakDuration || 5);
        setPomodorosCompleted(timerData.pomodorosCompleted || 0);
        setCurrentPhase(timerData.currentPhase || 'work');
        setFocusMode(timerData.focusMode || false);
        setSelectedCourseId(session.courseId || '');
        setSessionTitle(session.title || '');

        // Calculate time left based on start time
        const startTime = new Date(session.startTime);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const phaseDuration = timerData.currentPhase === 'work' ? timerData.workDuration * 60 : timerData.breakDuration * 60;
        const remaining = Math.max(phaseDuration - elapsed, 0);

        setTimeLeft(remaining);
        setIsRunning(false);
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const loadSessionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pomodoro/history?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionHistory(response.data);
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const loadStats = async (period) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/pomodoro/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const startTimer = async () => {
    if (!sessionId) {
      // Start new session
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/pomodoro/start', {
          courseId: selectedCourseId || null,
          taskId: selectedTaskId || null,
          timerMode,
          workDuration: timerMode === 'custom' ? customDuration : workDuration,
          breakDuration,
          title: sessionTitle || `${timerMode.charAt(0).toUpperCase() + timerMode.slice(1)} Session`,
          focusMode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSessionId(response.data.session.id);
        setSessionStartTime(new Date());

        const duration = timerMode === 'custom' ? customDuration : workDuration;
        setTimeLeft(duration * 60);
        setCurrentPhase('work');
        setIsRunning(true);
        setShowSettings(false);
      } catch (error) {
        console.error('Error starting timer:', error);
        alert('Failed to start timer session');
      }
    } else {
      // Resume existing session
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handlePhaseComplete = () => {
    setIsRunning(false);

    // Play notification sound
    playNotificationSound();

    // Show browser notification
    showNotification();

    if (currentPhase === 'work') {
      // Work phase complete, start break
      setPomodorosCompleted(prev => prev + 1);
      updateSessionProgress(pomodorosCompleted + 1);

      if (timerMode === 'pomodoro') {
        setCurrentPhase('break');
        setTimeLeft(breakDuration * 60);
        setShowBreakScreen(true);

        // Auto-start break after 3 seconds
        setTimeout(() => {
          setShowBreakScreen(false);
          setIsRunning(true);
        }, 3000);
      } else {
        // For custom timer, end session
        completeSession();
      }
    } else {
      // Break complete, start work
      setCurrentPhase('work');
      setTimeLeft(workDuration * 60);
      setIsRunning(true);
    }
  };

  const updateSessionProgress = async (pomodoros) => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/pomodoro/${sessionId}/update`, {
        pomodorosCompleted: pomodoros,
        currentPhase
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;

    try {
      const token = localStorage.getItem('token');
      const now = new Date();
      const actualDuration = Math.floor((now - sessionStartTime) / 1000);

      const response = await axios.post(`http://localhost:5000/api/pomodoro/${sessionId}/complete`, {
        pomodorosCompleted,
        actualDuration
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Session completed! 🎉\n\nRewards:\n+${response.data.rewards.xp} XP\n+${response.data.rewards.coins} coins\n${response.data.rewards.streak} day streak!`);

      // Reset timer
      resetTimer();
      loadSessionHistory();
      loadStats('today');
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session');
    }
  };

  const cancelSession = async () => {
    if (!sessionId) {
      resetTimer();
      return;
    }

    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/pomodoro/${sessionId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        resetTimer();
      } catch (error) {
        console.error('Error cancelling session:', error);
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSessionId(null);
    setSessionStartTime(null);
    setPomodorosCompleted(0);
    setCurrentPhase('work');
    setTimeLeft((timerMode === 'custom' ? customDuration : workDuration) * 60);
    setShowSettings(true);
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Could not play sound:', err));
  };

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = currentPhase === 'work' ? 'Work Session Complete!' : 'Break Over!';
      const body = currentPhase === 'work'
        ? `Great job! Time for a ${breakDuration} minute break.`
        : 'Break time is over. Ready to get back to work?';

      new Notification(title, { body, icon: '/logo192.png' });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = (currentPhase === 'work' ? workDuration : breakDuration) * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const playAmbientSound = (soundId) => {
    setSelectedAmbientSound(soundId);
    // In a real implementation, you would play the actual audio file
    console.log(`Playing ambient sound: ${soundId}`);
  };

  const stopAmbientSound = () => {
    setSelectedAmbientSound(null);
  };

  if (focusMode) {
    return (
      <div className="focus-mode-overlay">
        <div className="focus-mode-container">
          <button className="exit-focus-btn" onClick={toggleFocusMode}>
            Exit Focus Mode
          </button>

          <div className="focus-timer-display">
            <div className="focus-phase-indicator">
              {currentPhase === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
            </div>

            <div className="focus-timer-circle">
              <svg className="focus-progress-ring" width="300" height="300">
                <circle
                  className="focus-progress-ring-bg"
                  cx="150"
                  cy="150"
                  r="140"
                />
                <circle
                  className="focus-progress-ring-fill"
                  cx="150"
                  cy="150"
                  r="140"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 140}`,
                    strokeDashoffset: `${2 * Math.PI * 140 * (1 - getProgress() / 100)}`
                  }}
                />
              </svg>
              <div className="focus-time-text">{formatTime(timeLeft)}</div>
            </div>

            <div className="focus-controls">
              {!isRunning ? (
                <button className="focus-btn focus-btn-start" onClick={startTimer}>
                  {isPaused ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button className="focus-btn focus-btn-pause" onClick={pauseTimer}>
                  Pause
                </button>
              )}

              <button className="focus-btn focus-btn-skip" onClick={skipPhase}>
                Skip
              </button>
            </div>

            <div className="focus-pomodoro-count">
              🍅 {pomodorosCompleted} Pomodoros
            </div>
          </div>

          <div className="focus-ambient-sounds">
            <h4>Ambient Sounds</h4>
            <div className="ambient-sound-grid">
              {ambientSounds.map(sound => (
                <button
                  key={sound.id}
                  className={`ambient-sound-btn ${selectedAmbientSound === sound.id ? 'active' : ''}`}
                  onClick={() => selectedAmbientSound === sound.id ? stopAmbientSound() : playAmbientSound(sound.id)}
                >
                  <span className="sound-emoji">{sound.emoji}</span>
                  <span className="sound-name">{sound.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showBreakScreen) {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    return (
      <div className="break-screen-overlay">
        <div className="break-screen-content">
          <div className="break-icon">☕</div>
          <h2>Break Time!</h2>
          <p className="break-quote">{randomQuote}</p>
          <p className="break-duration">Taking a {breakDuration} minute break...</p>
          <div className="break-loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pomodoro-modal-overlay">
      <div className="pomodoro-modal">
        <div className="pomodoro-header">
          <h2>⏱️ Study Timer</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="pomodoro-content">
          {showSettings ? (
            <div className="timer-setup">
              <h3>Setup Your Study Session</h3>

              <div className="timer-mode-selector">
                <button
                  className={`mode-btn ${timerMode === 'pomodoro' ? 'active' : ''}`}
                  onClick={() => setTimerMode('pomodoro')}
                >
                  🍅 Pomodoro
                </button>
                <button
                  className={`mode-btn ${timerMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setTimerMode('custom')}
                >
                  ⏲️ Custom Timer
                </button>
                <button
                  className={`mode-btn ${timerMode === 'focus' ? 'active' : ''}`}
                  onClick={() => setTimerMode('focus')}
                >
                  🎯 Focus Mode
                </button>
              </div>

              {timerMode === 'pomodoro' && (
                <div className="pomodoro-settings">
                  <div className="setting-row">
                    <label>Work Duration (minutes)</label>
                    <input
                      type="number"
                      value={workDuration}
                      onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                      min="1"
                      max="120"
                    />
                  </div>
                  <div className="setting-row">
                    <label>Break Duration (minutes)</label>
                    <input
                      type="number"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
              )}

              {timerMode === 'custom' && (
                <div className="custom-settings">
                  <div className="setting-row">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(parseInt(e.target.value) || 30)}
                      min="1"
                      max="180"
                    />
                  </div>
                </div>
              )}

              <div className="session-details">
                <div className="setting-row">
                  <label>Session Title (optional)</label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g., Math Study Session"
                  />
                </div>

                <div className="setting-row">
                  <label>Course (optional)</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                  >
                    <option value="">No course</option>
                    {courses && courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-row checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => setFocusMode(e.target.checked)}
                    />
                    Enable Focus Mode
                  </label>
                </div>
              </div>

              <button className="start-session-btn" onClick={startTimer}>
                Start Session
              </button>
            </div>
          ) : (
            <div className="timer-active">
              <div className="timer-display">
                <div className="phase-indicator">
                  <span className={`phase-badge ${currentPhase}`}>
                    {currentPhase === 'work' ? '🎯 Work' : '☕ Break'}
                  </span>
                </div>

                <div className="timer-circle">
                  <svg className="progress-ring" width="200" height="200">
                    <circle
                      className="progress-ring-bg"
                      cx="100"
                      cy="100"
                      r="90"
                    />
                    <circle
                      className="progress-ring-fill"
                      cx="100"
                      cy="100"
                      r="90"
                      style={{
                        strokeDasharray: `${2 * Math.PI * 90}`,
                        strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgress() / 100)}`
                      }}
                    />
                  </svg>
                  <div className="time-display">{formatTime(timeLeft)}</div>
                </div>

                <div className="pomodoro-counter">
                  <span className="tomato-emoji">🍅</span>
                  <span className="counter-text">{pomodorosCompleted} Completed</span>
                </div>

                <div className="timer-controls">
                  {!isRunning ? (
                    <button className="control-btn primary" onClick={startTimer}>
                      {isPaused ? '▶️ Resume' : '▶️ Start'}
                    </button>
                  ) : (
                    <button className="control-btn" onClick={pauseTimer}>
                      ⏸️ Pause
                    </button>
                  )}

                  <button className="control-btn" onClick={skipPhase}>
                    ⏭️ Skip
                  </button>

                  <button className="control-btn" onClick={toggleFocusMode}>
                    🎯 Focus
                  </button>

                  <button className="control-btn danger" onClick={cancelSession}>
                    ❌ Cancel
                  </button>

                  {pomodorosCompleted > 0 && (
                    <button className="control-btn success" onClick={completeSession}>
                      ✅ Complete
                    </button>
                  )}
                </div>
              </div>

              <div className="session-info">
                {sessionTitle && <p className="session-title">{sessionTitle}</p>}
                {selectedCourseId && courses && (
                  <p className="session-course">
                    Course: {courses.find(c => c.id === parseInt(selectedCourseId))?.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="timer-tabs">
            <button
              className={`tab-btn ${!showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(false)}
            >
              Stats
            </button>
            <button
              className={`tab-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(true)}
            >
              History
            </button>
          </div>

          {!showHistory ? (
            <div className="timer-stats">
              {stats && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Today's Sessions:</span>
                    <span className="stat-value">{stats.totalSessions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Today's Study Time:</span>
                    <span className="stat-value">{stats.totalHours}h</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pomodoros Today:</span>
                    <span className="stat-value">🍅 {stats.totalPomodoros}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="timer-history">
              <h4>Recent Sessions</h4>
              {sessionHistory.length > 0 ? (
                <div className="history-list">
                  {sessionHistory.map(session => (
                    <div key={session.id} className="history-item">
                      <div className="history-info">
                        <span className="history-title">{session.title}</span>
                        <span className="history-date">
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="history-details">
                        <span>{Math.round(session.duration / 60)} min</span>
                        {session.timerData && session.timerData.pomodorosCompleted > 0 && (
                          <span>🍅 {session.timerData.pomodorosCompleted}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-history">No session history yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
