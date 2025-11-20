import React, { useState, useEffect } from 'react';
import { calendarAPI, studyTaskAPI, examReminderAPI } from '../services/api';
import './StudyCalendar.css';

const StudyCalendar = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadMonthEvents();
    loadSummary();
  }, [currentDate]);

  const loadMonthEvents = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await calendarAPI.getEvents({ month, year });
      setEvents(response.data.data.events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await calendarAPI.getSummary();
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await calendarAPI.getEventsByDay(dateStr);
      setSelectedDayEvents(response.data.data.events);
    } catch (error) {
      console.error('Error loading day events:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'task': return '✅';
      case 'exam': return '📝';
      case 'session': return '📚';
      default: return '📌';
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>📅 Study Calendar</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="calendar-summary">
          <div className="summary-card overdue">
            <span className="summary-count">{summary.overdueTasks.count}</span>
            <span className="summary-label">Overdue Tasks</span>
          </div>
          <div className="summary-card today">
            <span className="summary-count">{summary.todayTasks.count}</span>
            <span className="summary-label">Today's Tasks</span>
          </div>
          <div className="summary-card upcoming">
            <span className="summary-count">{summary.upcomingExams.count}</span>
            <span className="summary-label">Upcoming Exams</span>
          </div>
          <div className="summary-card pending">
            <span className="summary-count">{summary.pendingTasksCount}</span>
            <span className="summary-label">Pending Tasks</span>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="calendar-nav">
        <button onClick={() => changeMonth(-1)}>← Prev</button>
        <div className="current-month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={() => changeMonth(1)}>Next →</button>
        <button className="today-btn" onClick={goToToday}>Today</button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {/* Calendar days */}
        {getDaysInMonth().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
          }

          const dayEvents = getEventsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <div className="day-number">{date.getDate()}</div>
              {dayEvents.length > 0 && (
                <div className="day-events">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`event-dot ${event.type}`}
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    >
                      <span className="event-icon">{getEventIcon(event.type)}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="more-events">+{dayEvents.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="selected-day-panel">
          <h3>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>

          {selectedDayEvents.length === 0 ? (
            <p className="no-events">No events scheduled for this day</p>
          ) : (
            <div className="day-events-list">
              {selectedDayEvents.map((event, index) => (
                <div key={index} className={`event-item ${event.type}`}>
                  <div className="event-header">
                    <span className="event-type-icon">{getEventIcon(event.type)}</span>
                    <span className="event-title">{event.title}</span>
                  </div>

                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}

                  <div className="event-meta">
                    {event.time && <span>⏰ {event.time}</span>}
                    {event.location && <span>📍 {event.location}</span>}
                    {event.priority && (
                      <span className={`priority-badge ${event.priority}`}>
                        {event.priority.toUpperCase()}
                      </span>
                    )}
                    {event.examType && (
                      <span className="exam-type-badge">{event.examType}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="calendar-loading">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default StudyCalendar;
