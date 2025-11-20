/**
 * ============================================
 * Practice Questions Page for Students
 * ============================================
 * SM-2 spaced repetition algorithm
 * MCQ options are SHUFFLED every time
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PracticeQuestions.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Utility function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PracticeQuestions = () => {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [revealedRegions, setRevealedRegions] = useState([]);
  const [shuffledOrderedItems, setShuffledOrderedItems] = useState([]);

  // Load questions
  useEffect(() => {
    loadQuestions();
  }, [courseId]);

  // Shuffle MCQ options and ordered items when question changes
  useEffect(() => {
    const current = questions[currentIndex];
    if (current && current.cardType === 'multiple_choice' && current.options) {
      // IMPORTANT: Shuffle options every time the question is displayed
      setShuffledOptions(shuffleArray(current.options));
    } else {
      setShuffledOptions([]);
    }

    if (current && current.cardType === 'ordered' && current.orderedItems) {
      // Shuffle ordered items for students to rearrange
      setShuffledOrderedItems(shuffleArray(current.orderedItems));
    } else {
      setShuffledOrderedItems([]);
    }

    setUserAnswer('');
    setShowAnswer(false);
    setRevealedRegions([]);
  }, [currentIndex, questions]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = courseId ? { courseId } : {};

      const response = await axios.get(`${API_BASE_URL}/cards/due`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setQuestions(response.data.data.cards || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    const current = questions[currentIndex];

    // For image occlusion, check if all regions are revealed
    if (current.cardType === 'image') {
      const allRevealed = current.occludedRegions?.every((_, idx) => revealedRegions.includes(idx));
      if (!allRevealed) {
        alert('Please click on all occluded regions to reveal them');
        return;
      }
    } else {
      if (!userAnswer.trim()) {
        alert('Please provide an answer');
        return;
      }
    }

    setShowAnswer(true);
  };

  const toggleRegion = (index) => {
    if (showAnswer) return; // Don't allow toggling after showing answer

    if (revealedRegions.includes(index)) {
      setRevealedRegions(revealedRegions.filter(i => i !== index));
    } else {
      setRevealedRegions([...revealedRegions, index]);
    }
  };

  const rateAnswer = async (quality) => {
    try {
      const token = localStorage.getItem('token');
      const currentQuestion = questions[currentIndex];

      // Submit review to update SM-2 algorithm
      await axios.post(
        `${API_BASE_URL}/study/review`,
        {
          cardId: currentQuestion.id,
          quality,
          responseTime: 0 // Can be enhanced with actual time tracking
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        alert('Great job! You have completed all due questions for now.');
        loadQuestions(); // Reload to check for new due questions
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit answer');
    }
  };

  const handleClozeInput = (value) => {
    setUserAnswer(value);
  };

  const moveItemUp = (index) => {
    if (index === 0) return;
    const newItems = [...shuffledOrderedItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setShuffledOrderedItems(newItems);
  };

  const moveItemDown = (index) => {
    if (index === shuffledOrderedItems.length - 1) return;
    const newItems = [...shuffledOrderedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setShuffledOrderedItems(newItems);
  };

  if (loading) {
    return (
      <div className="practice-page">
        <div className="loading">Loading practice questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="practice-page">
        <div className="empty-state">
          <h2>🎉 All Caught Up!</h2>
          <p>You don't have any questions due for review right now.</p>
          <p>Come back later for more practice!</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // Check if answer is correct based on question type
  let isCorrect = false;
  if (currentQuestion.cardType === 'image') {
    isCorrect = revealedRegions.length === currentQuestion.occludedRegions?.length;
  } else if (currentQuestion.cardType === 'ordered') {
    // Check if the order matches exactly
    isCorrect = JSON.stringify(shuffledOrderedItems) === JSON.stringify(currentQuestion.orderedItems);
  } else {
    isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase();
  }

  return (
    <div className="practice-page">
      {/* Progress Header */}
      <div className="practice-header">
        <div className="progress-info">
          <span className="progress-text">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="sm2-badge" title="Using SM-2 Spaced Repetition Algorithm">
          📊 SM-2 Algorithm
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-type-badge">
          {currentQuestion.cardType === 'basic' && '📝 Short Answer'}
          {currentQuestion.cardType === 'cloze' && '✍️ Fill in the Blanks'}
          {currentQuestion.cardType === 'multiple_choice' && '☑️ Multiple Choice'}
          {currentQuestion.cardType === 'image' && '🖼️ Image Occlusion'}
          {currentQuestion.cardType === 'ordered' && '🔢 Ordered Sequence'}
        </div>

        <div className="question-content">
          <h2>{currentQuestion.question}</h2>
          {currentQuestion.hint && !showAnswer && (
            <div className="hint">
              <strong>💡 Hint:</strong> {currentQuestion.hint}
            </div>
          )}
        </div>

        {/* Answer Input */}
        {!showAnswer && (
          <div className="answer-section">
            {currentQuestion.cardType === 'image' ? (
              // Image Occlusion
              <div className="picture-quiz-practice">
                <p className="occlusion-instructions">
                  👆 Click on the blurred regions to reveal what's hidden
                </p>
                <div className="image-container">
                  <img
                    src={currentQuestion.imageUrl?.startsWith('http')
                      ? currentQuestion.imageUrl
                      : `${window.location.origin}${currentQuestion.imageUrl}`
                    }
                    alt="Question"
                    className="practice-image"
                  />
                  <svg className="occlusion-overlay" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                    {currentQuestion.occludedRegions?.map((region, idx) => (
                      <g key={idx}>
                        <rect
                          x={region.x}
                          y={region.y}
                          width={region.width}
                          height={region.height}
                          className={`occluded-rect ${revealedRegions.includes(idx) ? 'revealed' : ''}`}
                          onClick={() => toggleRegion(idx)}
                          style={{ cursor: 'pointer' }}
                        />
                        {revealedRegions.includes(idx) && (
                          <text
                            x={region.x + region.width / 2}
                            y={region.y + region.height / 2}
                            className="revealed-text"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {region.answer}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="regions-status">
                  Revealed: {revealedRegions.length} / {currentQuestion.occludedRegions?.length || 0}
                </div>
              </div>
            ) : currentQuestion.cardType === 'multiple_choice' ? (
              // MCQ with SHUFFLED options
              <div className="mcq-options">
                <p className="shuffle-notice">
                  🔀 Options are shuffled for better learning!
                </p>
                {shuffledOptions.map((option, index) => (
                  <label key={index} className="mcq-option">
                    <input
                      type="radio"
                      name="mcq-answer"
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion.cardType === 'ordered' ? (
              // Ordered sequence with reordering controls
              <div className="ordered-items-practice">
                <p className="shuffle-notice">
                  🔢 Arrange these items in the correct order
                </p>
                <div className="ordered-items-list">
                  {shuffledOrderedItems.map((item, index) => (
                    <div key={index} className="ordered-item">
                      <span className="item-number">{index + 1}.</span>
                      <span className="item-text">{item}</span>
                      <div className="item-controls">
                        <button
                          onClick={() => moveItemUp(index)}
                          disabled={index === 0}
                          className="btn-move-item"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItemDown(index)}
                          disabled={index === shuffledOrderedItems.length - 1}
                          className="btn-move-item"
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Text input for other types
              <input
                type="text"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here..."
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                autoFocus
              />
            )}

            <button className="btn-submit" onClick={submitAnswer}>
              Check Answer
            </button>
          </div>
        )}

        {/* Answer Feedback */}
        {showAnswer && (
          <div className="feedback-section">
            {currentQuestion.cardType === 'image' ? (
              <>
                <div className="result correct">
                  <div className="result-icon">✅</div>
                  <h3>All regions revealed!</h3>
                </div>
                <div className="picture-quiz-answers">
                  <h4>Complete Answers:</h4>
                  <div className="image-container">
                    <img
                      src={currentQuestion.imageUrl?.startsWith('http')
                        ? currentQuestion.imageUrl
                        : `${window.location.origin}${currentQuestion.imageUrl}`
                      }
                      alt="Question with answers"
                      className="practice-image"
                    />
                    <svg className="occlusion-overlay" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
                      {currentQuestion.occludedRegions?.map((region, idx) => (
                        <g key={idx}>
                          <rect
                            x={region.x}
                            y={region.y}
                            width={region.width}
                            height={region.height}
                            className="occluded-rect revealed"
                          />
                          <text
                            x={region.x + region.width / 2}
                            y={region.y + region.height / 2}
                            className="revealed-text"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {region.answer}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="answers-list">
                    {currentQuestion.occludedRegions?.map((region, idx) => (
                      <div key={idx} className="answer-item">
                        <strong>Region {idx + 1}:</strong> {region.answer}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? (
                    <>
                      <div className="result-icon">✅</div>
                      <h3>Correct!</h3>
                    </>
                  ) : (
                    <>
                      <div className="result-icon">❌</div>
                      <h3>Not quite right</h3>
                      <p>Your answer: <strong>{userAnswer}</strong></p>
                      <p>Correct answer: <strong>{currentQuestion.answer}</strong></p>
                    </>
                  )}
                </div>

                {currentQuestion.explanation && (
                  <div className="explanation">
                    <h4>💡 Explanation:</h4>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}

            {/* SM-2 Rating Buttons */}
            <div className="rating-section">
              <h4>How well did you know this?</h4>
              <div className="rating-buttons">
                <button
                  className="rating-btn rating-1"
                  onClick={() => rateAnswer(1)}
                >
                  <span>😰</span>
                  <span>Not at all</span>
                </button>
                <button
                  className="rating-btn rating-2"
                  onClick={() => rateAnswer(2)}
                >
                  <span>😐</span>
                  <span>Barely</span>
                </button>
                <button
                  className="rating-btn rating-3"
                  onClick={() => rateAnswer(3)}
                >
                  <span>🙂</span>
                  <span>Good</span>
                </button>
                <button
                  className="rating-btn rating-4"
                  onClick={() => rateAnswer(4)}
                >
                  <span>😄</span>
                  <span>Perfect</span>
                </button>
              </div>
              <p className="sm2-help">
                Your response helps the SM-2 algorithm determine when to show this question again
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Question Stats */}
      <div className="question-stats">
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className={`stat-value status-${currentQuestion.status}`}>
            {currentQuestion.status}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Times Reviewed:</span>
          <span className="stat-value">{currentQuestion.timesReviewed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Accuracy:</span>
          <span className="stat-value">
            {currentQuestion.timesReviewed > 0
              ? Math.round((currentQuestion.timesCorrect / currentQuestion.timesReviewed) * 100)
              : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PracticeQuestions;
