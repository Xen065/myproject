/**
 * Question Modal Component
 * Supports: Short Questions, Fill in the Blanks, Multiple Choice, Image Quiz, Ordered, True/False, Multi-Select, Matching, Categorization
 */
import React, { useState, useEffect } from 'react';
import { adminCardAPI } from '../../services/adminApi';
import ImageOcclusionEditor from './ImageOcclusionEditor';
import OrderedQuestionEditor from './OrderedQuestionEditor';
import MultiSelectEditor from './MultiSelectEditor';
import MatchingPairsEditor from './MatchingPairsEditor';
import CategorizationEditor from './CategorizationEditor';
import './Modal.css';

const QuestionModal = ({ courseId, question, modules, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cardType: 'basic', // basic, cloze, multiple_choice, image, ordered, true_false, matching, categorization
    moduleId: '',
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    options: ['', '', '', ''], // For MCQ
    allowMultipleCorrect: false, // For MCQ: true = multiple correct answers, false = single correct answer
    imageUrl: '', // For image quiz
    occludedRegions: [], // For image quiz
    orderedItems: [], // For ordered questions
    multiSelectAnswers: [], // For multiple correct answers in MCQ
    matchingPairs: [], // For matching pairs
    categories: {}, // For categorization
    tags: [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (question?.id) {
      // Convert old multi_select type to multiple_choice with allowMultipleCorrect = true
      const cardType = question.cardType === 'multi_select' ? 'multiple_choice' : question.cardType;
      const allowMultipleCorrect = question.cardType === 'multi_select' || question.allowMultipleCorrect || false;

      setFormData({
        cardType: cardType || 'basic',
        moduleId: question.moduleId || '',
        question: question.question || '',
        answer: question.answer || '',
        hint: question.hint || '',
        explanation: question.explanation || '',
        options: question.options || ['', '', '', ''],
        allowMultipleCorrect: allowMultipleCorrect,
        imageUrl: question.imageUrl || '',
        occludedRegions: question.occludedRegions || [],
        orderedItems: question.orderedItems || [],
        multiSelectAnswers: question.multiSelectAnswers || [],
        matchingPairs: question.matchingPairs || [],
        categories: question.categories || {},
        tags: question.tags || [],
      });
      if (question.imageUrl) {
        // Construct full URL if it's a relative path
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const fullImageUrl = question.imageUrl.startsWith('http')
          ? question.imageUrl
          : `${API_BASE_URL}${question.imageUrl}`;
        setPreviewUrl(fullImageUrl);
      }
    } else if (question?.moduleId) {
      setFormData({ ...formData, moduleId: question.moduleId });
    }
  }, [question]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload image immediately
    try {
      setUploading(true);
      setError(null);

      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await adminCardAPI.uploadImage(formDataObj);

      if (response.data && response.data.data && response.data.data.imageUrl) {
        // Construct full URL for image preview
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const fullImageUrl = `${API_BASE_URL}${response.data.data.imageUrl}`;
        setFormData(prev => ({ ...prev, imageUrl: response.data.data.imageUrl }));
        setPreviewUrl(fullImageUrl);
      }

      setUploading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }

    // Validate courseId is present
    if (!courseId) {
      setError('Course ID is required');
      return;
    }

    // Type-specific validation
    if (formData.cardType === 'multiple_choice') {
      const validOptions = formData.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        setError('Multiple choice questions must have at least 2 options');
        return;
      }

      if (formData.allowMultipleCorrect) {
        // Multiple correct answers
        if (!formData.multiSelectAnswers || formData.multiSelectAnswers.length === 0) {
          setError('Please select at least one correct answer');
          return;
        }
        // Verify all selected answers are in the options
        const invalidAnswer = formData.multiSelectAnswers.find(ans => !validOptions.includes(ans));
        if (invalidAnswer) {
          setError('All correct answers must be in the options list');
          return;
        }
      } else {
        // Single correct answer
        if (!formData.answer || !formData.answer.trim()) {
          setError('Please select the correct answer');
          return;
        }
        if (!validOptions.includes(formData.answer.trim())) {
          setError('The correct answer must be one of the options');
          return;
        }
      }
    } else if (formData.cardType === 'image') {
      if (!formData.imageUrl) {
        setError('Please upload an image');
        return;
      }
      if (!formData.occludedRegions || formData.occludedRegions.length === 0) {
        setError('Please create at least one occluded region');
        return;
      }
      const invalidRegion = formData.occludedRegions.find(r => !r.answer || !r.answer.trim());
      if (invalidRegion) {
        setError('Please provide an answer for all occluded regions');
        return;
      }
    } else if (formData.cardType === 'ordered') {
      if (!formData.orderedItems || formData.orderedItems.length < 2) {
        setError('Ordered questions must have at least 2 items');
        return;
      }
    } else if (formData.cardType === 'true_false') {
      if (!formData.answer || !['true', 'false'].includes(formData.answer.toLowerCase())) {
        setError('Please select True or False');
        return;
      }
    } else if (formData.cardType === 'matching') {
      if (!formData.matchingPairs || formData.matchingPairs.length < 2) {
        setError('Matching questions must have at least 2 pairs');
        return;
      }
    } else if (formData.cardType === 'categorization') {
      const categoryNames = Object.keys(formData.categories);
      if (categoryNames.length < 2) {
        setError('Categorization questions must have at least 2 categories');
        return;
      }
      const emptyCategory = categoryNames.find(cat => formData.categories[cat].length === 0);
      if (emptyCategory) {
        setError(`Category "${emptyCategory}" must have at least one item`);
        return;
      }
    } else {
      // Basic and cloze
      if (!formData.answer.trim()) {
        setError('Answer is required');
        return;
      }
    }

    try {
      setSaving(true);
      const data = {
        courseId: parseInt(courseId),
        moduleId: formData.moduleId ? parseInt(formData.moduleId) : null,
        question: formData.question,
        answer: formData.answer || '',
        hint: formData.hint || null,
        explanation: formData.explanation || null,
        cardType: formData.cardType,
        options: formData.cardType === 'multiple_choice'
          ? formData.options.filter(opt => opt.trim())
          : null,
        allowMultipleCorrect: formData.cardType === 'multiple_choice' ? formData.allowMultipleCorrect : null,
        imageUrl: formData.cardType === 'image' ? formData.imageUrl : null,
        occludedRegions: formData.cardType === 'image' ? formData.occludedRegions : null,
        orderedItems: formData.cardType === 'ordered' ? formData.orderedItems : null,
        multiSelectAnswers: (formData.cardType === 'multiple_choice' && formData.allowMultipleCorrect)
          ? formData.multiSelectAnswers
          : null,
        matchingPairs: formData.cardType === 'matching' ? formData.matchingPairs : null,
        categories: formData.cardType === 'categorization' ? formData.categories : null,
        tags: formData.tags,
      };

      console.log('Saving question with data:', data);

      let response;
      if (question?.id) {
        console.log('Updating existing question:', question.id);
        response = await adminCardAPI.update(question.id, data);
      } else {
        console.log('Creating new question');
        response = await adminCardAPI.create(data);
      }

      console.log('Save response:', response.data);

      // Call onSave and wait a moment for parent to process
      if (onSave) {
        await onSave();
      }

      // Reset saving state before closing
      setSaving(false);
      onClose();
    } catch (err) {
      console.error('Error saving question:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to save question');
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
                <option value="true_false">✓✗ True/False</option>
                <option value="matching">🔗 Matching Pairs</option>
                <option value="categorization">📦 Categorization</option>
                <option value="image">🖼️ Image Quiz</option>
                <option value="ordered">🔢 Ordered Sequence</option>
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

          {formData.cardType === 'image' ? (
            <>
              <div className="form-group">
                <label>Image *</label>
                <small className="help-text">
                  Upload an image and draw rectangles to hide parts of it. Students will practice recalling what's hidden.
                </small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <p className="upload-status">Uploading image...</p>}
              </div>

              {previewUrl && (
                <ImageOcclusionEditor
                  imageUrl={previewUrl}
                  regions={formData.occludedRegions}
                  onChange={(regions) => setFormData({ ...formData, occludedRegions: regions })}
                />
              )}

              <div className="form-group">
                <label>Question Title *</label>
                <small className="help-text">
                  Give this image quiz a descriptive title (e.g., "Parts of a Cell", "Countries in Europe")
                </small>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                  placeholder="e.g., Label the parts of the diagram"
                />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

          {formData.cardType === 'multiple_choice' ? (
            <>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allowMultipleCorrect}
                    onChange={(e) => setFormData({
                      ...formData,
                      allowMultipleCorrect: e.target.checked,
                      // Reset answers when switching modes
                      multiSelectAnswers: e.target.checked ? [] : formData.multiSelectAnswers,
                      answer: !e.target.checked ? '' : formData.answer
                    })}
                  />
                  <span>Allow multiple correct answers</span>
                </label>
                <small className="help-text">
                  {formData.allowMultipleCorrect
                    ? 'Students will use checkboxes and must select ALL correct answers'
                    : 'Students will use radio buttons and select ONE correct answer'}
                </small>
              </div>

              {formData.allowMultipleCorrect ? (
                <>
                  <MultiSelectEditor
                    options={formData.options}
                    correctAnswers={formData.multiSelectAnswers}
                    onOptionsChange={(options) => setFormData({ ...formData, options })}
                    onAnswersChange={(answers) => setFormData({ ...formData, multiSelectAnswers: answers })}
                  />
                  <div className="info-box">
                    <strong>☑️ Students must select ALL correct answers!</strong>
                    <p>Options will be shuffled. Students need to check all answers you marked as correct.</p>
                  </div>
                </>
              ) : (
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
              )}
            </>
          ) : formData.cardType === 'ordered' ? (
            <>
              <OrderedQuestionEditor
                items={formData.orderedItems}
                onChange={(items) => setFormData({ ...formData, orderedItems: items })}
              />
              <div className="info-box">
                <strong>🔢 Items will be shuffled for students!</strong>
                <p>Students will need to arrange these items in the correct order you specified above.</p>
              </div>
            </>
          ) : formData.cardType === 'true_false' ? (
            <div className="form-group">
              <label>Correct Answer *</label>
              <div className="true-false-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="trueFalse"
                    value="true"
                    checked={formData.answer.toLowerCase() === 'true'}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  />
                  <span>True ✓</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="trueFalse"
                    value="false"
                    checked={formData.answer.toLowerCase() === 'false'}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  />
                  <span>False ✗</span>
                </label>
              </div>
            </div>
          ) : formData.cardType === 'matching' ? (
            <>
              <MatchingPairsEditor
                pairs={formData.matchingPairs}
                onChange={(pairs) => setFormData({ ...formData, matchingPairs: pairs })}
              />
              <div className="info-box">
                <strong>🔗 Right column items will be shuffled!</strong>
                <p>Students will need to correctly match each item from the left column to the right column.</p>
              </div>
            </>
          ) : formData.cardType === 'categorization' ? (
            <>
              <CategorizationEditor
                categories={formData.categories}
                onChange={(categories) => setFormData({ ...formData, categories })}
              />
              <div className="info-box">
                <strong>📦 Items will be shuffled!</strong>
                <p>Students will need to correctly sort all items into their categories.</p>
              </div>
            </>
          ) : formData.cardType !== 'image' && (
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

          {formData.cardType !== 'image' && (
            <>
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
            </>
          )}

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
