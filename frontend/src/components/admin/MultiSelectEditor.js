/**
 * Multi-Select Editor Component
 * Allows teachers to create multi-select questions with multiple correct answers
 */
import React, { useState } from 'react';
import './MultiSelectEditor.css';

const MultiSelectEditor = ({ options = [], correctAnswers = [], onOptionsChange, onAnswersChange }) => {
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const updatedOptions = [...options, newOption.trim()];
      onOptionsChange(updatedOptions);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    const removedOption = options[index];
    const updatedOptions = options.filter((_, i) => i !== index);
    onOptionsChange(updatedOptions);

    // Remove from correct answers if it was selected
    if (correctAnswers.includes(removedOption)) {
      const updatedAnswers = correctAnswers.filter(ans => ans !== removedOption);
      onAnswersChange(updatedAnswers);
    }
  };

  const handleToggleAnswer = (option) => {
    let updatedAnswers;
    if (correctAnswers.includes(option)) {
      updatedAnswers = correctAnswers.filter(ans => ans !== option);
    } else {
      updatedAnswers = [...correctAnswers, option];
    }
    onAnswersChange(updatedAnswers);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  return (
    <div className="multi-select-editor">
      <div className="editor-header">
        <h4>Options</h4>
        <p className="help-text">Add options and check which ones are correct answers</p>
      </div>

      {/* Options List */}
      <div className="options-list">
        {options.length === 0 ? (
          <div className="empty-state">No options added yet. Add your first option below.</div>
        ) : (
          options.map((option, index) => (
            <div key={index} className="option-row">
              <label className="option-checkbox">
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(option)}
                  onChange={() => handleToggleAnswer(option)}
                />
                <span className="checkbox-label">Correct</span>
              </label>
              <span className="option-text">{option}</span>
              <button
                onClick={() => handleRemoveOption(index)}
                className="btn-remove"
                title="Remove option"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Option */}
      <div className="add-option-section">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a new option..."
          className="add-option-input"
        />
        <button onClick={handleAddOption} className="btn-add">
          Add Option
        </button>
      </div>

      {/* Summary */}
      {options.length > 0 && (
        <div className="options-summary">
          <span>Total options: {options.length}</span>
          <span className="divider">•</span>
          <span className="correct-count">
            Correct answers: {correctAnswers.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default MultiSelectEditor;
