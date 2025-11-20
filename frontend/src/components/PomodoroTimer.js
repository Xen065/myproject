import React, { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  // Timer modes
  const MODES = {
    WORK: 'work',
    SHORT_BREAK: 'shortBreak',
    LONG_BREAK: 'longBreak'
  };

  // Default durations (in seconds)
  const DEFAULT_DURATIONS = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  // State management
  const [mode, setMode] = useState(MODES.WORK);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // Update document title
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (isRunning) {
      document.title = `${timeString} - ${getModeLabel(mode)} | EduMaster`;
    } else {
      document.title = 'Study Tools | EduMaster';
    }

    return () => {
      document.title = 'EduMaster';
    };
  }, [timeLeft, isRunning, mode]);

  // Play notification sound
  const playSound = () => {
    if (!soundEnabled || !audioRef.current) return;

    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    playSound();

    // Send browser notification if permitted
    if (Notification.permission === 'granted') {
      const message = mode === MODES.WORK
        ? 'Work session complete! Time for a break.'
        : 'Break is over! Ready to focus?';
      new Notification('Pomodoro Timer', { body: message });
    }

    // Log session history
    const sessionLog = {
      mode,
      completedAt: new Date().toISOString(),
      duration: durations[mode]
    };
    setSessionHistory(prev => [...prev, sessionLog].slice(-10)); // Keep last 10 sessions

    if (mode === MODES.WORK) {
      const newSessionCount = completedSessions + 1;
      setCompletedSessions(newSessionCount);

      // Determine next mode
      const nextMode = newSessionCount % 4 === 0 ? MODES.LONG_BREAK : MODES.SHORT_BREAK;
      setMode(nextMode);
      setTimeLeft(durations[nextMode]);

      if (autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      setMode(MODES.WORK);
      setTimeLeft(durations.work);

      if (autoStartPomodoros) {
        setIsRunning(true);
      }
    }
  };

  // Control functions
  const startTimer = () => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const skipTimer = () => {
    handleTimerComplete();
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  const resetAllSessions = () => {
    setCompletedSessions(0);
    setSessionHistory([]);
    setIsRunning(false);
    setMode(MODES.WORK);
    setTimeLeft(durations.work);
  };

  // Update duration settings
  const updateDuration = (mode, minutes) => {
    const newDurations = { ...durations, [mode]: minutes * 60 };
    setDurations(newDurations);
    if (!isRunning) {
      setTimeLeft(newDurations[mode]);
    }
  };

  // Helper functions
  const getModeLabel = (mode) => {
    switch (mode) {
      case MODES.WORK: return 'Focus Time';
      case MODES.SHORT_BREAK: return 'Short Break';
      case MODES.LONG_BREAK: return 'Long Break';
      default: return '';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = durations[mode];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="pomodoro-timer">
      {/* Mode Tabs */}
      <div className="timer-modes">
        <button
          className={`mode-tab ${mode === MODES.WORK ? 'active work' : ''}`}
          onClick={() => switchMode(MODES.WORK)}
          disabled={isRunning}
        >
          Focus
        </button>
        <button
          className={`mode-tab ${mode === MODES.SHORT_BREAK ? 'active short-break' : ''}`}
          onClick={() => switchMode(MODES.SHORT_BREAK)}
          disabled={isRunning}
        >
          Short Break
        </button>
        <button
          className={`mode-tab ${mode === MODES.LONG_BREAK ? 'active long-break' : ''}`}
          onClick={() => switchMode(MODES.LONG_BREAK)}
          disabled={isRunning}
        >
          Long Break
        </button>
      </div>

      {/* Timer Display */}
      <div className={`timer-display ${mode}`}>
        <svg className="progress-ring" width="300" height="300">
          <circle
            className="progress-ring-circle-bg"
            cx="150"
            cy="150"
            r="130"
          />
          <circle
            className="progress-ring-circle"
            cx="150"
            cy="150"
            r="130"
            style={{
              strokeDashoffset: 817 - (817 * getProgress()) / 100
            }}
          />
        </svg>
        <div className="timer-content">
          <div className="timer-label">{getModeLabel(mode)}</div>
          <div className="timer-time">{formatTime(timeLeft)}</div>
          <div className="timer-sessions">
            Session {completedSessions + 1} • {completedSessions} completed
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        {!isRunning ? (
          <button className="control-btn start-btn" onClick={startTimer}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start
          </button>
        ) : (
          <button className="control-btn pause-btn" onClick={pauseTimer}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            Pause
          </button>
        )}
        <button className="control-btn reset-btn" onClick={resetTimer}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          Reset
        </button>
        <button className="control-btn skip-btn" onClick={skipTimer} disabled={!isRunning}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
          Skip
        </button>
      </div>

      {/* Quick Actions */}
      <div className="timer-actions">
        <button
          className="action-btn settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Settings
        </button>
        <button className="action-btn reset-all-btn" onClick={resetAllSessions}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Reset All
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Timer Settings</h3>

          <div className="settings-section">
            <h4>Duration (minutes)</h4>
            <div className="setting-item">
              <label>Focus Time:</label>
              <input
                type="number"
                min="1"
                max="60"
                value={durations.work / 60}
                onChange={(e) => updateDuration('work', parseInt(e.target.value) || 25)}
                disabled={isRunning}
              />
            </div>
            <div className="setting-item">
              <label>Short Break:</label>
              <input
                type="number"
                min="1"
                max="30"
                value={durations.shortBreak / 60}
                onChange={(e) => updateDuration('shortBreak', parseInt(e.target.value) || 5)}
                disabled={isRunning}
              />
            </div>
            <div className="setting-item">
              <label>Long Break:</label>
              <input
                type="number"
                min="1"
                max="60"
                value={durations.longBreak / 60}
                onChange={(e) => updateDuration('longBreak', parseInt(e.target.value) || 15)}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="settings-section">
            <h4>Auto-start</h4>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                />
                Auto-start breaks
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={autoStartPomodoros}
                  onChange={(e) => setAutoStartPomodoros(e.target.checked)}
                />
                Auto-start focus sessions
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h4>Notifications</h4>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                Sound notifications
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Session History */}
      {sessionHistory.length > 0 && (
        <div className="session-history">
          <h3>Recent Sessions</h3>
          <div className="history-list">
            {sessionHistory.slice().reverse().map((session, index) => (
              <div key={index} className={`history-item ${session.mode}`}>
                <span className="history-type">{getModeLabel(session.mode)}</span>
                <span className="history-duration">{session.duration / 60} min</span>
                <span className="history-time">
                  {new Date(session.completedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
