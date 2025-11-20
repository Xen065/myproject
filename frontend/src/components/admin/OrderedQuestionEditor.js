/**
 * Ordered Question Editor Component
 * Allows teachers to create ordered lists where items must be arranged in sequence
 */
import React, { useState } from 'react';
import './OrderedQuestionEditor.css';

const OrderedQuestionEditor = ({ items = [], onChange }) => {
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem.trim()];
      onChange(updatedItems);
      setNewItem('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
    onChange(updatedItems);
  };

  const handleMoveDown = (index) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];
    onChange(updatedItems);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = () => {
    if (editingValue.trim() && editingIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = editingValue.trim();
      onChange(updatedItems);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="ordered-question-editor">
      <div className="editor-header">
        <h4>Items (in correct order)</h4>
        <p className="help-text">Add items in the correct sequence. Students will need to arrange them in this order.</p>
      </div>

      {/* Item List */}
      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-state">
            No items added yet. Add your first item below.
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="item-row">
              <div className="item-number">{index + 1}.</div>

              {editingIndex === index ? (
                <div className="item-edit">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={handleEditKeyPress}
                    autoFocus
                    className="edit-input"
                  />
                  <button onClick={handleSaveEdit} className="btn-save">Save</button>
                  <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="item-text">{item}</div>
                  <div className="item-actions">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="btn-move"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                      className="btn-move"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleStartEdit(index)}
                      className="btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Item */}
      <div className="add-item-section">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a new item..."
          className="add-item-input"
        />
        <button onClick={handleAddItem} className="btn-add">
          Add Item
        </button>
      </div>

      {items.length > 0 && (
        <div className="items-summary">
          Total items: {items.length}
        </div>
      )}
    </div>
  );
};

export default OrderedQuestionEditor;
