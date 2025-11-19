/**
 * Question Modal Component
 * Supports: Short Questions, Fill in the Blanks, Multiple Choice
 */
import React, { useState, useEffect } from 'react';
import { adminCardAPI } from '../../services/adminApi';
import './Modal.css';

const QuestionModal = ({ courseId, question, modules, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cardType: 'basic', // basic, cloze, multiple_choice
    moduleId: '',
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    options: ['', '', '', ''], // For MCQ
    tags: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (question?.id) {
      setFormData({
        cardType: question.cardType || 'basic',
        moduleId: question.moduleId || '',
        question: question.question || '',
        answer: question.answer || '',
        hint: question.hint || '',
        explanation: question.explanation || '',
        options: question.options || ['', '', '', ''],
        tags: question.tags || [],
      });
    } else if (question?.moduleId) {
      setFormData({ ...formData, moduleId: question.moduleId });
    }
  }, [question]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }

    if (!formData.answer.trim()) {
      setError('Answer is required');
      return;
    }

    // MCQ specific validation
    if (formData.cardType === 'multiple_choice') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice questions must have at least 2 options');
        return;
      }
      if (!validOptions.includes(formData.answer.trim())) {
        setError('The correct answer must be one of the options');
        return;
      }
    }

    try {
      setSaving(true);
      const data = {
        courseId,
        moduleId: formData.moduleId || null,
        question: formData.question,
        answer: formData.answer,
        hint: formData.hint || null,
        explanation: formData.explanation || null,
        cardType: formData.cardType,
        options: formData.cardType === 'multiple_choice'
          ? formData.options.filter(opt => opt.trim())
          : null,
        tags: formData.tags,
      };

      if (question?.id) {
        await adminCardAPI.update(question.id, data);
      } else {
        await adminCardAPI.create(data);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save question');
      setSaving(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      setError('Must have at least 2 options');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{question?.id ? 'Edit Question' : 'Add New Question'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Question Type *</label>
              <select
                value={formData.cardType}
                onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                required
              >
                <option value="basic">📝 Short Answer</option>
                <option value="cloze">✍️ Fill in the Blanks</option>
                <option value="multiple_choice">☑️ Multiple Choice (MCQ)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Module</label>
              <select
                value={formData.moduleId}
                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
              >
                <option value="">No Module</option>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.icon} {mod.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Question *</label>
            {formData.cardType === 'cloze' && (
              <small className="help-text">
                Use <strong>___</strong> (3 underscores) to indicate blanks. Example: "The capital of France is ___"
              </small>
            )}
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              required
              placeholder={
                formData.cardType === 'cloze'
                  ? 'The capital of France is ___'
                  : 'Enter your question here...'
              }
            />
          </div>

          {formData.cardType === 'multiple_choice' ? (
            <>
              <div className="form-group">
                <label>Options * (at least 2)</label>
                <div className="options-list">
                  {formData.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          className="btn-remove-option"
                          onClick={() => removeOption(index)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-add-option"
                    onClick={addOption}
                  >
                    + Add Option
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Correct Answer *</label>
                <select
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                >
                  <option value="">Select the correct answer</option>
                  {formData.options
                    .filter(opt => opt.trim())
                    .map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              <div className="info-box">
                <strong>🔀 Options will be shuffled for students!</strong>
                <p>The order of options will be randomized each time a student sees this question.</p>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Correct Answer *</label>
              <input
                type="text"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                placeholder={
                  formData.cardType === 'cloze'
                    ? 'Paris'
                    : 'The correct answer'
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>Hint (optional)</label>
            <input
              type="text"
              value={formData.hint}
              onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
              placeholder="A helpful hint for students"
            />
          </div>

          <div className="form-group">
            <label>Explanation (optional)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={2}
              placeholder="Explain why this is the correct answer (shown after answering)"
            />
          </div>

          <div className="info-box sm2-info">
            <h4>📊 SM-2 Spaced Repetition</h4>
            <p>
              This question will be shown to students using the SM-2 algorithm, which optimizes
              review intervals based on how well they remember the answer.
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
