import React, { useState, useEffect } from 'react';
import { courseAPI, cardAPI, studyAPI, userSettingsAPI } from '../services/api';
import './Study.css';

function Study() {
  const [view, setView] = useState('course-selection'); // 'course-selection' or 'studying'
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [mode, setMode] = useState('due'); // 'due' or 'all'
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    correct: 0,
    incorrect: 0,
  });
  const [filters, setFilters] = useState({
    difficultOnly: false,
    recentlyLearned: false,
    shuffle: false,
  });
  const [allCards, setAllCards] = useState([]); // Store unfiltered cards
  const [frequencyMode, setFrequencyMode] = useState('normal'); // 'intensive', 'normal', or 'relaxed'
  const [showFrequencyMenu, setShowFrequencyMenu] = useState(false);

  // Calculate card difficulty level
  const getDifficultyLevel = (card) => {
    if (!card.repetitions || card.repetitions === 0) {
      return { level: 'New', color: 'new' };
    } else if (card.repetitions < 5) {
      return { level: 'Learning', color: 'learning' };
    } else {
      return { level: 'Mastered', color: 'mastered' };
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
    fetchFrequencyMode();
  }, []);

  const fetchFrequencyMode = async () => {
    try {
      const response = await userSettingsAPI.getFrequencyMode();
      if (response.data.success) {
        setFrequencyMode(response.data.data.frequencyMode || 'normal');
      }
    } catch (err) {
      console.error('Failed to load frequency mode:', err);
    }
  };

  const handleFrequencyModeChange = async (newMode) => {
    try {
      const response = await userSettingsAPI.updateFrequencyMode(newMode);
      if (response.data.success) {
        setFrequencyMode(newMode);
        setShowFrequencyMenu(false);
        alert(`Frequency mode changed to ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}`);
      }
    } catch (err) {
      console.error('Failed to update frequency mode:', err);
      alert('Failed to update frequency mode. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchCards();
    }
  }, [mode, selectedCourse]);

  useEffect(() => {
    // Start timer when card is shown
    if (!flipped && view === 'studying') {
      setStartTime(Date.now());
    }
  }, [currentCardIndex, flipped, view]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getEnrolled();

      if (response.data.success) {
        const enrollments = response.data.data.enrollments || [];

        // Fetch card counts for each course
        const coursesWithCounts = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const [allCardsRes, dueCardsRes] = await Promise.all([
                cardAPI.getAll({ courseId: enrollment.Course.id, limit: 1000 }),
                cardAPI.getDueCards({ courseId: enrollment.Course.id, limit: 1000 })
              ]);

              return {
                ...enrollment.Course,
                totalCards: allCardsRes.data.data?.cards?.length || 0,
                dueCards: dueCardsRes.data.data?.cards?.length || 0
              };
            } catch (err) {
              console.error('Error fetching card counts:', err);
              return {
                ...enrollment.Course,
                totalCards: 0,
                dueCards: 0
              };
            }
          })
        );

        setEnrolledCourses(coursesWithCounts);
      }
    } catch (err) {
      console.error('Failed to load enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = mode === 'due'
        ? await cardAPI.getDueCards({ courseId: selectedCourse.id })
        : await cardAPI.getAll({ courseId: selectedCourse.id, limit: 200 });

      if (response.data.success) {
        const fetchedCards = response.data.data.cards || [];
        setAllCards(fetchedCards);
        setCards(fetchedCards);
        setView('studying');
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filters change
  useEffect(() => {
    if (allCards.length === 0) return;

    let filtered = [...allCards];

    // Filter difficult cards (ease factor < 2.3)
    if (filters.difficultOnly) {
      filtered = filtered.filter(card => card.easeFactor < 2.3);
    }

    // Filter recently learned (reviewed in last 7 days)
    if (filters.recentlyLearned) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(card => {
        const lastReview = card.lastReviewDate ? new Date(card.lastReviewDate) : null;
        return lastReview && lastReview >= sevenDaysAgo;
      });
    }

    // Shuffle cards
    if (filters.shuffle) {
      filtered = filtered.sort(() => Math.random() - 0.5);
    }

    setCards(filtered);
    setCurrentCardIndex(0);
    setFlipped(false);
  }, [filters, allCards]);

  const handleCourseSelect = (course, studyMode) => {
    setSelectedCourse(course);
    setMode(studyMode);
    setCurrentCardIndex(0);
    setFlipped(false);
    setFilters({
      difficultOnly: false,
      recentlyLearned: false,
      shuffle: false,
    });
    setSessionStats({
      cardsReviewed: 0,
      correct: 0,
      incorrect: 0,
    });
  };

  const handleBackToCourses = () => {
    setView('course-selection');
    setSelectedCourse(null);
    setCards([]);
    setAllCards([]);
    setCurrentCardIndex(0);
    setFlipped(false);
    setFilters({
      difficultOnly: false,
      recentlyLearned: false,
      shuffle: false,
    });
    setSessionStats({
      cardsReviewed: 0,
      correct: 0,
      incorrect: 0,
    });
    fetchEnrolledCourses(); // Refresh counts
  };

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    setShowHint(false); // Reset hint when flipping
  };

  const handleRevealAnswer = (e) => {
    e.stopPropagation(); // Prevent card click event
    setFlipped(true);
    setShowHint(false);
  };

  const handleShowHint = (e) => {
    e.stopPropagation(); // Prevent card flip when clicking hint button
    setShowHint(true);
  };

  const handleReview = async (quality) => {
    if (reviewing || cards.length === 0) return;

    setReviewing(true);
    const currentCard = cards[currentCardIndex];
    const responseTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;

    try {
      await studyAPI.reviewCard(currentCard.id, quality, responseTime);

      // Update session stats
      setSessionStats((prev) => ({
        cardsReviewed: prev.cardsReviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect,
      }));

      // Move to next card or finish session
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setFlipped(false);
        setShowHint(false);
      } else {
        // All cards reviewed
        setCurrentCardIndex(cards.length);
      }
    } catch (err) {
      console.error('Failed to review card:', err);
      alert('Failed to save your review. Please try again.');
    } finally {
      setReviewing(false);
    }
  };

  // Course Selection View
  if (view === 'course-selection') {
    if (loading) {
      return <div className="loading-container">Loading your courses...</div>;
    }

    if (enrolledCourses.length === 0) {
      return (
        <div className="study-container">
          <div className="study-header">
            <h1>Study Flashcards</h1>
          </div>
          <div className="no-cards-message">
            <p>You haven't enrolled in any courses yet.</p>
            <button onClick={() => (window.location.href = '/courses')} className="btn-primary">
              Browse Courses
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="study-container">
        <div className="study-header">
          <h1>Select a Course to Study</h1>
          <p className="info-text">Choose a course and study mode to begin your practice session</p>
        </div>

        <div className="course-selection-grid">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="course-study-card">
              <div className="course-study-header">
                <span className="course-icon">{course.icon}</span>
                <h3>{course.title}</h3>
              </div>

              <div className="course-study-stats">
                <div className="stat-item">
                  <span className="stat-number">{course.totalCards}</span>
                  <span className="stat-label">Total Cards</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number due">{course.dueCards}</span>
                  <span className="stat-label">Due Today</span>
                </div>
              </div>

              <div className="course-study-actions">
                <button
                  onClick={() => handleCourseSelect(course, 'due')}
                  className="btn-study due"
                  disabled={course.dueCards === 0}
                >
                  Study Due Cards ({course.dueCards})
                </button>
                <button
                  onClick={() => handleCourseSelect(course, 'all')}
                  className="btn-study all"
                  disabled={course.totalCards === 0}
                >
                  Practice All ({course.totalCards})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Studying View
  if (loading) {
    return <div className="loading-container">Loading cards...</div>;
  }

  if (cards.length === 0 || currentCardIndex >= cards.length) {
    return (
      <div className="study-complete-container">
        <h1>Study Session Complete!</h1>
        {sessionStats.cardsReviewed > 0 ? (
          <div className="session-summary">
            <h2>Session Summary</h2>
            <div className="summary-stats">
              <div className="summary-stat">
                <span className="stat-number">{sessionStats.cardsReviewed}</span>
                <span className="stat-label">Cards Reviewed</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">{sessionStats.correct}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="summary-stat">
                <span className="stat-number">
                  {Math.round((sessionStats.correct / sessionStats.cardsReviewed) * 100)}%
                </span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
            <div className="complete-actions">
              <button onClick={handleBackToCourses} className="btn-primary">
                Choose Another Course
              </button>
              <button onClick={() => (window.location.href = '/dashboard')} className="btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="no-cards-message">
            <p>No cards {mode === 'due' ? 'due for review' : 'available'} in this course.</p>
            <button onClick={handleBackToCourses} className="btn-primary">
              Choose Another Course
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;
  const difficulty = getDifficultyLevel(currentCard);

  return (
    <div className="study-container">
      <div className="study-header">
        <button onClick={handleBackToCourses} className="back-button">
          ← Back to Courses
        </button>
        <h1>{selectedCourse?.title}</h1>
        <div className="mode-badge">
          {mode === 'due' ? 'Due Cards' : 'All Cards'}
        </div>
        <div className="progress-info">
          Card {currentCardIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="filter-controls">
        <button
          onClick={() => toggleFilter('difficultOnly')}
          className={`filter-btn ${filters.difficultOnly ? 'active' : ''}`}
        >
          🔥 Difficult Only
        </button>
        <button
          onClick={() => toggleFilter('recentlyLearned')}
          className={`filter-btn ${filters.recentlyLearned ? 'active' : ''}`}
        >
          📚 Recently Learned
        </button>
        <button
          onClick={() => toggleFilter('shuffle')}
          className={`filter-btn ${filters.shuffle ? 'active' : ''}`}
        >
          🔀 Shuffle
        </button>
        <div className="frequency-mode-selector">
          <button
            onClick={() => setShowFrequencyMenu(!showFrequencyMenu)}
            className="filter-btn frequency-btn"
          >
            ⚡ Frequency: {frequencyMode.charAt(0).toUpperCase() + frequencyMode.slice(1)}
          </button>
          {showFrequencyMenu && (
            <div className="frequency-menu">
              <button
                onClick={() => handleFrequencyModeChange('intensive')}
                className={`frequency-option ${frequencyMode === 'intensive' ? 'active' : ''}`}
              >
                <strong>⚡ Intensive</strong>
                <span className="frequency-desc">1d → 3d (faster reviews)</span>
              </button>
              <button
                onClick={() => handleFrequencyModeChange('normal')}
                className={`frequency-option ${frequencyMode === 'normal' ? 'active' : ''}`}
              >
                <strong>📖 Normal</strong>
                <span className="frequency-desc">1d → 4d (standard)</span>
              </button>
              <button
                onClick={() => handleFrequencyModeChange('relaxed')}
                className={`frequency-option ${frequencyMode === 'relaxed' ? 'active' : ''}`}
              >
                <strong>🌙 Relaxed</strong>
                <span className="frequency-desc">2d → 7d (slower reviews)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className={`difficulty-badge ${difficulty.color}`}>
              {difficulty.level}
            </div>
            <h2>Question</h2>
            <p className="card-content">{currentCard.question}</p>

            {currentCard.hint && !flipped && (
              <div className="hint-section">
                {!showHint ? (
                  <button
                    onClick={handleShowHint}
                    className="hint-button"
                  >
                    💡 Show Hint
                  </button>
                ) : (
                  <div className="card-hint">
                    <strong>Hint:</strong> {currentCard.hint}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleRevealAnswer}
              className="reveal-answer-button"
            >
              👁️ Reveal Answer
            </button>
          </div>
          <div className="flashcard-back">
            <div className={`difficulty-badge ${difficulty.color}`}>
              {difficulty.level}
            </div>
            <h2>Answer</h2>
            <p className="card-content">{currentCard.answer}</p>
            {currentCard.explanation && (
              <div className="card-explanation">
                <strong>Explanation:</strong> {currentCard.explanation}
              </div>
            )}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="rating-buttons">
          <button
            onClick={() => handleReview(1)}
            className="rating-btn again"
            disabled={reviewing}
          >
            Again
            <span className="rating-desc">Didn't know</span>
            <span className="rating-time">1 day</span>
          </button>
          <button
            onClick={() => handleReview(2)}
            className="rating-btn hard"
            disabled={reviewing}
          >
            Hard
            <span className="rating-desc">Struggled</span>
            <span className="rating-time">3 days</span>
          </button>
          <button
            onClick={() => handleReview(3)}
            className="rating-btn good"
            disabled={reviewing}
          >
            Good
            <span className="rating-desc">Remembered</span>
            <span className="rating-time">6+ days</span>
          </button>
          <button
            onClick={() => handleReview(4)}
            className="rating-btn easy"
            disabled={reviewing}
          >
            Easy
            <span className="rating-desc">Too easy</span>
            <span className="rating-time">Longer</span>
          </button>
        </div>
      )}

      <div className="session-stats-mini">
        <span>Reviewed: {sessionStats.cardsReviewed}</span>
        <span>Correct: {sessionStats.correct}</span>
        <span>Accuracy: {sessionStats.cardsReviewed > 0 ? Math.round((sessionStats.correct / sessionStats.cardsReviewed) * 100) : 0}%</span>
      </div>

      <div className="study-info">
        <p className="info-text">
          Rate your recall to optimize spaced repetition
        </p>
      </div>
    </div>
  );
}

export default Study;
