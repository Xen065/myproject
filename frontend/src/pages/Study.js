/**
 * ============================================
 * Study Page
 * ============================================
 * Flashcard review interface with spaced repetition
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { cardsAPI, studyAPI } from '../services/api';
import './Study.css';

function Study() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      const response = await cardsAPI.getDue();
      setCards(response.data.cards || []);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    if (reviewing) return;

    setReviewing(true);
    const currentCard = cards[currentIndex];

    try {
      await studyAPI.review(currentCard.id, quality);

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Finished all cards
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to review card:', error);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading-container">Loading cards...</div>
      </>
    );
  }

  if (cards.length === 0) {
    return (
      <>
        <Navigation />
        <div className="study-container">
          <div className="no-cards">
            <h2>🎉 All Caught Up!</h2>
            <p>You have no cards due for review right now.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <>
      <Navigation />
      <div className="study-container">
        <div className="study-header">
          <div className="progress-info">
            Card {currentIndex + 1} of {cards.length}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="flashcard-container">
          <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
            <div className="flashcard-front">
              <div className="card-label">Question</div>
              <div className="card-content">
                {currentCard.question}
              </div>
              {currentCard.hint && !showAnswer && (
                <div className="card-hint">
                  💡 Hint: {currentCard.hint}
                </div>
              )}
            </div>

            {showAnswer && (
              <div className="flashcard-back">
                <div className="card-label">Answer</div>
                <div className="card-content">
                  {currentCard.answer}
                </div>
                {currentCard.explanation && (
                  <div className="card-explanation">
                    📖 {currentCard.explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="btn-primary btn-large"
            >
              Show Answer
            </button>
          ) : (
            <div className="review-buttons">
              <p className="review-prompt">How well did you know this?</p>
              <div className="button-grid">
                <button
                  onClick={() => handleReview(1)}
                  className="btn-review btn-again"
                  disabled={reviewing}
                >
                  ❌ Again
                </button>
                <button
                  onClick={() => handleReview(2)}
                  className="btn-review btn-hard"
                  disabled={reviewing}
                >
                  😓 Hard
                </button>
                <button
                  onClick={() => handleReview(3)}
                  className="btn-review btn-good"
                  disabled={reviewing}
                >
                  👍 Good
                </button>
                <button
                  onClick={() => handleReview(4)}
                  className="btn-review btn-easy"
                  disabled={reviewing}
                >
                  ✨ Easy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="study-footer">
          <div className="card-info">
            <span>Course: {currentCard.course?.title || 'Unknown'}</span>
            <span>Status: {currentCard.status}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Study;
