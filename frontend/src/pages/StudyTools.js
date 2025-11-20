import React, { useState } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import './StudyTools.css';

const StudyTools = () => {
  const [activeTab, setActiveTab] = useState('pomodoro');

  const tools = [
    {
      id: 'pomodoro',
      name: 'Pomodoro Timer',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
      ),
      description: 'Classic Pomodoro technique with customizable intervals'
    },
    {
      id: 'more',
      name: 'More Tools Coming Soon',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      ),
      description: 'Additional study tools will be added here',
      disabled: true
    }
  ];

  return (
    <div className="study-tools-page">
      <div className="study-tools-header">
        <h1>Study Tools</h1>
        <p className="subtitle">Boost your productivity and focus with our study tools</p>
      </div>

      {/* Tool Selection */}
      <div className="tools-selector">
        {tools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-card ${activeTab === tool.id ? 'active' : ''} ${tool.disabled ? 'disabled' : ''}`}
            onClick={() => !tool.disabled && setActiveTab(tool.id)}
            disabled={tool.disabled}
          >
            <div className="tool-icon">{tool.icon}</div>
            <div className="tool-info">
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>
            {tool.disabled && <span className="coming-soon-badge">Coming Soon</span>}
          </button>
        ))}
      </div>

      {/* Active Tool Content */}
      <div className="tool-content">
        {activeTab === 'pomodoro' && (
          <div className="pomodoro-section">
            <div className="tool-intro">
              <h2>Pomodoro Timer</h2>
              <p>
                The Pomodoro Technique is a time management method that uses 25-minute focused work sessions
                followed by short breaks. After 4 sessions, take a longer break to recharge.
              </p>
              <div className="pomodoro-tips">
                <div className="tip">
                  <span className="tip-icon">🎯</span>
                  <div>
                    <strong>Stay Focused:</strong> During work sessions, eliminate all distractions
                  </div>
                </div>
                <div className="tip">
                  <span className="tip-icon">☕</span>
                  <div>
                    <strong>Take Breaks:</strong> Use breaks to rest, stretch, or grab a snack
                  </div>
                </div>
                <div className="tip">
                  <span className="tip-icon">📊</span>
                  <div>
                    <strong>Track Progress:</strong> Monitor your completed sessions to stay motivated
                  </div>
                </div>
              </div>
            </div>

            <PomodoroTimer />

            <div className="study-tips-section">
              <h3>Maximize Your Study Sessions</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-number">1</div>
                  <h4>Plan Your Tasks</h4>
                  <p>Before starting, list what you want to accomplish in each Pomodoro session.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">2</div>
                  <h4>Minimize Interruptions</h4>
                  <p>Put your phone on silent and close unnecessary browser tabs.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">3</div>
                  <h4>Take Real Breaks</h4>
                  <p>Step away from your desk during breaks. Move around and rest your eyes.</p>
                </div>
                <div className="tip-card">
                  <div className="tip-number">4</div>
                  <h4>Stay Consistent</h4>
                  <p>Use the technique regularly to build a productive study habit.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTools;
