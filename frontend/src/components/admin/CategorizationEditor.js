/**
 * Categorization Editor Component
 * Allows teachers to create categorization questions with multiple categories and items
 */
import React, { useState } from 'react';
import './CategorizationEditor.css';

const CategorizationEditor = ({ categories = {}, onChange }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItems, setNewItems] = useState({});  // Track new item input for each category
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories[newCategoryName.trim()]) {
      const updatedCategories = {
        ...categories,
        [newCategoryName.trim()]: []
      };
      onChange(updatedCategories);
      setNewCategoryName('');
    }
  };

  const handleRemoveCategory = (categoryName) => {
    const updatedCategories = { ...categories };
    delete updatedCategories[categoryName];
    onChange(updatedCategories);
  };

  const handleAddItem = (categoryName) => {
    const itemText = newItems[categoryName]?.trim();
    if (itemText && categories[categoryName]) {
      const updatedCategories = {
        ...categories,
        [categoryName]: [...categories[categoryName], itemText]
      };
      onChange(updatedCategories);
      setNewItems({ ...newItems, [categoryName]: '' });
    }
  };

  const handleRemoveItem = (categoryName, itemIndex) => {
    const updatedCategories = {
      ...categories,
      [categoryName]: categories[categoryName].filter((_, i) => i !== itemIndex)
    };
    onChange(updatedCategories);
  };

  const handleStartEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setEditingCategoryName(categoryName);
  };

  const handleSaveEditCategory = () => {
    if (editingCategoryName.trim() && editingCategory && editingCategoryName !== editingCategory) {
      if (!categories[editingCategoryName.trim()]) {
        const updatedCategories = { ...categories };
        updatedCategories[editingCategoryName.trim()] = updatedCategories[editingCategory];
        delete updatedCategories[editingCategory];
        onChange(updatedCategories);
      }
    }
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleKeyPress = (e, action, param) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'addCategory') {
        handleAddCategory();
      } else if (action === 'addItem') {
        handleAddItem(param);
      }
    }
  };

  const categoryNames = Object.keys(categories);
  const totalItems = categoryNames.reduce((sum, cat) => sum + categories[cat].length, 0);

  return (
    <div className="categorization-editor">
      <div className="editor-header">
        <h4>Categories & Items</h4>
        <p className="help-text">Create categories and add items that belong to each category</p>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {categoryNames.length === 0 ? (
          <div className="empty-state">No categories added yet. Add your first category below.</div>
        ) : (
          categoryNames.map((categoryName) => (
            <div key={categoryName} className="category-box">
              <div className="category-header">
                {editingCategory === categoryName ? (
                  <div className="edit-category-name">
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="category-name-input"
                      autoFocus
                    />
                    <button onClick={handleSaveEditCategory} className="btn-save-small">
                      ✓
                    </button>
                    <button onClick={handleCancelEditCategory} className="btn-cancel-small">
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <h5 className="category-name">{categoryName}</h5>
                    <div className="category-actions">
                      <button
                        onClick={() => handleStartEditCategory(categoryName)}
                        className="btn-edit-category"
                        title="Edit category name"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRemoveCategory(categoryName)}
                        className="btn-remove-category"
                        title="Remove category"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Items in Category */}
              <div className="category-items">
                {categories[categoryName].length === 0 ? (
                  <div className="no-items">No items yet</div>
                ) : (
                  categories[categoryName].map((item, index) => (
                    <div key={index} className="category-item">
                      <span className="item-text">{item}</span>
                      <button
                        onClick={() => handleRemoveItem(categoryName, index)}
                        className="btn-remove-item"
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Item Input */}
              <div className="add-item-input-section">
                <input
                  type="text"
                  value={newItems[categoryName] || ''}
                  onChange={(e) => setNewItems({ ...newItems, [categoryName]: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, 'addItem', categoryName)}
                  placeholder="Add item..."
                  className="add-item-input-small"
                />
                <button
                  onClick={() => handleAddItem(categoryName)}
                  className="btn-add-item"
                  title="Add item"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Section */}
      <div className="add-category-section">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'addCategory')}
          placeholder="Enter new category name..."
          className="add-category-input"
        />
        <button onClick={handleAddCategory} className="btn-add-category">
          Add Category
        </button>
      </div>

      {/* Summary */}
      {categoryNames.length > 0 && (
        <div className="categories-summary">
          <span>Categories: {categoryNames.length}</span>
          <span className="divider">•</span>
          <span>Total items: {totalItems}</span>
        </div>
      )}
    </div>
  );
};

export default CategorizationEditor;
