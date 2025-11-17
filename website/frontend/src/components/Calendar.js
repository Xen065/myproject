import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button
} from '@mui/material';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { getAllStudySessions, getOwnedCourses } from '../api';

function Calendar() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsResponse, coursesResponse] = await Promise.all([
        getAllStudySessions(),
        getOwnedCourses()
      ]);
      setSessions(sessionsResponse.data);
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDate = (date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledDate);
      return isSameDay(sessionDate, date);
    });
  };

  const getCourseById = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Study Calendar
      </Typography>

      {/* Week View */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {weekDays.map((day, index) => {
          const daySessions = getSessionsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <Grid item xs={12} sm={6} md key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? 2 : 0,
                  borderColor: 'primary.main',
                  backgroundColor: isToday ? '#EEF2FF' : 'background.paper',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => setSelectedDate(day)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} textAlign="center">
                    {format(day, 'EEE')}
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    textAlign="center"
                    color={isToday ? 'primary.main' : 'text.primary'}
                  >
                    {format(day, 'd')}
                  </Typography>
                  {daySessions.length > 0 && (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${daySessions.length} session${daySessions.length > 1 ? 's' : ''}`}
                        color="primary"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Day Sessions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Typography>

          {getSessionsForDate(selectedDate).length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No study sessions scheduled for this day
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {getSessionsForDate(selectedDate).map((session) => {
                const course = getCourseById(session.courseId);
                return (
                  <Card key={session.id} variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h4">{course?.icon}</Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {course?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.duration} minutes • {session.cardsReviewed || 0} cards
                        </Typography>
                      </Box>
                      {session.isCompleted ? (
                        <Chip label="Completed" color="success" />
                      ) : (
                        <Chip label="Scheduled" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Upcoming Study Sessions
          </Typography>
          {sessions.filter(s => !s.isCompleted && new Date(s.scheduledDate) > new Date()).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No upcoming sessions scheduled
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              {sessions
                .filter(s => !s.isCompleted && new Date(s.scheduledDate) > new Date())
                .slice(0, 5)
                .map((session) => {
                  const course = getCourseById(session.courseId);
                  return (
                    <Box
                      key={session.id}
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{course?.icon}</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {course?.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(session.scheduledDate), 'MMM d, h:mm a')}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Calendar;
