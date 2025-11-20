/**
 * Matching Pairs Editor Component
 * Allows teachers to create matching questions with left-right pairs
 */
import React, { useState } from 'react';
import './MatchingPairsEditor.css';

const MatchingPairsEditor = ({ pairs = [], onChange }) => {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingLeft, setEditingLeft] = useState('');
  const [editingRight, setEditingRight] = useState('');

  const handleAddPair = () => {
    if (leftInput.trim() && rightInput.trim()) {
      const newPair = {
        left: leftInput.trim(),
        right: rightInput.trim()
      };
      onChange([...pairs, newPair]);
      setLeftInput('');
      setRightInput('');
    }
  };

  const handleRemovePair = (index) => {
    const updatedPairs = pairs.filter((_, i) => i !== index);
    onChange(updatedPairs);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingLeft(pairs[index].left);
    setEditingRight(pairs[index].right);
  };

  const handleSaveEdit = () => {
    if (editingLeft.trim() && editingRight.trim() && editingIndex !== null) {
      const updatedPairs = [...pairs];
      updatedPairs[editingIndex] = {
        left: editingLeft.trim(),
        right: editingRight.trim()
      };
      onChange(updatedPairs);
      setEditingIndex(null);
      setEditingLeft('');
      setEditingRight('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingLeft('');
    setEditingRight('');
  };

  const handleKeyPress = (e, isLeft) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLeft && rightInput.trim()) {
        // If in left field and right field has value, add pair
        handleAddPair();
      } else if (!isLeft && leftInput.trim()) {
        // If in right field and left field has value, add pair
        handleAddPair();
      }
    }
  };

  return (
    <div className="matching-pairs-editor">
      <div className="editor-header">
        <h4>Matching Pairs</h4>
        <p className="help-text">Create pairs of items that students need to match correctly</p>
      </div>

      {/* Pairs List */}
      <div className="pairs-list">
        {pairs.length === 0 ? (
          <div className="empty-state">No pairs added yet. Add your first pair below.</div>
        ) : (
          <div className="pairs-grid-header">
            <span className="col-label">Left Column</span>
            <span className="arrow-col"></span>
            <span className="col-label">Right Column</span>
            <span className="actions-col"></span>
          </div>
        )}

        {pairs.map((pair, index) => (
          <div key={index} className="pair-row">
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editingLeft}
                  onChange={(e) => setEditingLeft(e.target.value)}
                  className="edit-input"
                  placeholder="Left item"
                />
                <span className="pair-arrow">→</span>
                <input
                  type="text"
                  value={editingRight}
                  onChange={(e) => setEditingRight(e.target.value)}
                  className="edit-input"
                  placeholder="Right item"
                />
                <div className="pair-actions">
                  <button onClick={handleSaveEdit} className="btn-save">
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="pair-item left-item">{pair.left}</span>
                <span className="pair-arrow">→</span>
                <span className="pair-item right-item">{pair.right}</span>
                <div className="pair-actions">
                  <button
                    onClick={() => handleStartEdit(index)}
                    className="btn-edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemovePair(index)}
                    className="btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Pair Section */}
      <div className="add-pair-section">
        <input
          type="text"
          value={leftInput}
          onChange={(e) => setLeftInput(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, true)}
          placeholder="Left item (e.g., Paris)"
          className="add-input left"
        />
        <span className="pair-arrow-static">→</span>
        <input
          type="text"
          value={rightInput}
          onChange={(e) => setRightInput(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, false)}
          placeholder="Right item (e.g., Capital of France)"
          className="add-input right"
        />
        <button onClick={handleAddPair} className="btn-add">
          Add Pair
        </button>
      </div>

      {/* Summary */}
      {pairs.length > 0 && (
        <div className="pairs-summary">
          Total pairs: {pairs.length}
        </div>
      )}
    </div>
  );
};

export default MatchingPairsEditor;
