import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  Close,
  Lightbulb,
  ThumbDown,
  SentimentNeutral,
  ThumbUp,
  Favorite
} from '@mui/icons-material';
import { getDueCards, reviewCard, getCourseById } from '../api';

function Study({ refreshStats }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseResponse, cardsResponse] = await Promise.all([
        getCourseById(courseId),
        getDueCards(courseId)
      ]);
      setCourse(courseResponse.data);
      setCards(cardsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching study data:', error);
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (quality) => {
    if (currentIndex >= cards.length) return;

    try {
      const response = await reviewCard(cards[currentIndex].id, quality);

      // Show reward
      setReward({
        xp: response.data.xpGained,
        coins: response.data.coinsGained
      });

      // Update session stats
      setSessionStats({
        correct: quality >= 3 ? sessionStats.correct + 1 : sessionStats.correct,
        total: sessionStats.total + 1
      });

      // Move to next card after a brief delay
      setTimeout(() => {
        setReward(null);
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
          setShowHint(false);
        } else {
          // Session complete
          refreshStats();
        }
      }, 1500);
    } catch (error) {
      console.error('Error reviewing card:', error);
    }
  };

  if (!courseId) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Select a course to start studying
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (!course || cards.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          No cards due for review!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          All caught up! Come back later for more cards.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isComplete = currentIndex >= cards.length;

  if (isComplete) {
    const accuracy = sessionStats.total > 0
      ? Math.round((sessionStats.correct / sessionStats.total) * 100)
      : 0;

    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Session Complete!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Great job! You've reviewed all due cards.
        </Typography>

        <Card sx={{ maxWidth: 400, margin: '0 auto', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Session Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
              <Box>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {sessionStats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cards Reviewed
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {accuracy}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Accuracy
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {course.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Card {currentIndex + 1} of {cards.length}
          </Typography>
        </Box>
        <IconButton onClick={() => navigate('/')}>
          <Close />
        </IconButton>
      </Box>

      {/* Progress */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      {/* Reward notification */}
      {reward && (
        <Alert severity="success" sx={{ mb: 2 }}>
          +{reward.xp} XP, +{reward.coins} coins earned!
        </Alert>
      )}

      {/* Flashcard */}
      <Card
        sx={{
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          mb: 3,
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }}
        onClick={handleFlip}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            p: 4
          }}
        >
          <Chip
            label={isFlipped ? 'Answer' : 'Question'}
            color={isFlipped ? 'success' : 'primary'}
            sx={{ mb: 3 }}
          />

          <Typography
            variant="h4"
            fontWeight={600}
            sx={{ mb: 3 }}
          >
            {isFlipped ? currentCard.answer : currentCard.question}
          </Typography>

          {!isFlipped && currentCard.hint && (
            <Box>
              <Button
                startIcon={<Lightbulb />}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(!showHint);
                }}
                size="small"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              {showHint && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, fontStyle: 'italic' }}
                >
                  💡 {currentCard.hint}
                </Typography>
              )}
            </Box>
          )}

          {!isFlipped && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              Click to reveal answer
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Review Buttons (only shown when flipped) */}
      {isFlipped && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" textAlign="center" gutterBottom>
            How well did you know this?
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 2
            }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<ThumbDown />}
              onClick={() => handleReview(1)}
              sx={{ py: 2 }}
            >
              Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<SentimentNeutral />}
              onClick={() => handleReview(3)}
              sx={{ py: 2 }}
            >
              Hard
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<ThumbUp />}
              onClick={() => handleReview(4)}
              sx={{ py: 2 }}
            >
              Good
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Favorite />}
              onClick={() => handleReview(5)}
              sx={{ py: 2 }}
            >
              Easy
            </Button>
          </Box>
        </Box>
      )}

      {/* Session Stats */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {sessionStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reviewed
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {sessionStats.correct}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {cards.length - currentIndex - 1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Remaining
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Study;
