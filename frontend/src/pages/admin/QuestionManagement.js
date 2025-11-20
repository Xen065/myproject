/**
 * ============================================
 * Question Management Page
 * ============================================
 * Centralized management for all questions with filters, search, and bulk actions
 */

import React, { useState, useEffect } from 'react';
import { adminCardAPI, adminCourseAPI } from '../../services/adminApi';
import QuestionModal from '../../components/admin/QuestionModal';
import './QuestionManagement.css';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Selection
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Question types mapping
  const questionTypes = {
    basic: '📝 Short Answer',
    cloze: '✍️ Fill in the Blanks',
    multiple_choice: '☑️ Multiple Choice',
    multi_select: '☑️ Multiple Choice (Multi-Select)', // Legacy type - now unified with multiple_choice
    true_false: '✓✗ True/False',
    matching: '🔗 Matching Pairs',
    categorization: '📦 Categorization',
    image: '🖼️ Image Quiz',
    ordered: '🔢 Ordered Sequence'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, coursesRes] = await Promise.all([
        adminCardAPI.getAll(),
        adminCourseAPI.getAll()
      ]);

      // Ensure we always set arrays, handling various response structures
      const questionsData = questionsRes?.data?.cards || questionsRes?.data?.data || questionsRes?.data || [];
      const coursesData = coursesRes?.data?.data || coursesRes?.data || [];

      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load questions');
      // Ensure arrays are set even on error
      setQuestions([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter questions
  const filteredQuestions = Array.isArray(questions) ? questions.filter(q => {
    const matchesSearch = searchTerm === '' ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.answer && q.answer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCourse = selectedCourse === '' || q.courseId === parseInt(selectedCourse);
    const matchesType = selectedType === '' || q.cardType === selectedType;
    const matchesStatus = selectedStatus === '' ||
      (selectedStatus === 'active' && q.isActive && !q.isSuspended) ||
      (selectedStatus === 'suspended' && q.isSuspended) ||
      (selectedStatus === 'inactive' && !q.isActive);

    return matchesSearch && matchesCourse && matchesType && matchesStatus;
  }) : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const handleToggleActive = async (questionId) => {
    try {
      const question = Array.isArray(questions) ? questions.find(q => q.id === questionId) : null;
      if (!question) return;

      await adminCardAPI.update(questionId, {
        isActive: !question.isActive
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update question status');
    }
  };

  const handleToggleSuspended = async (questionId) => {
    try {
      const question = Array.isArray(questions) ? questions.find(q => q.id === questionId) : null;
      if (!question) return;

      await adminCardAPI.update(questionId, {
        isSuspended: !question.isSuspended
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling suspended:', err);
      alert('Failed to update question status');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await adminCardAPI.delete(questionId);
      fetchData();
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.length} question(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedQuestions.map(id => adminCardAPI.delete(id)));
      setSelectedQuestions([]);
      fetchData();
    } catch (err) {
      console.error('Error deleting questions:', err);
      alert('Failed to delete some questions');
    }
  };

  const handleBulkToggleStatus = async (status) => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to update');
      return;
    }

    try {
      await Promise.all(
        selectedQuestions.map(id =>
          adminCardAPI.update(id, status === 'suspend' ? { isSuspended: true } : { isActive: status === 'activate' })
        )
      );
      setSelectedQuestions([]);
      fetchData();
    } catch (err) {
      console.error('Error updating questions:', err);
      alert('Failed to update some questions');
    }
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === currentQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(currentQuestions.map(q => q.id));
    }
  };

  const handleSelectQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const getStatusBadge = (question) => {
    if (question.isSuspended) {
      return <span className="status-badge suspended">Suspended</span>;
    }
    if (!question.isActive) {
      return <span className="status-badge inactive">Inactive</span>;
    }
    return <span className="status-badge active">Active</span>;
  };

  if (loading) {
    return (
      <div className="question-management">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="question-management">
      <div className="page-header">
        <h1>Question Management</h1>
        <p>Manage all questions across all courses</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search questions or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            {Object.entries(questionTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCourse('');
              setSelectedType('');
              setSelectedStatus('');
            }}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedQuestions.length} question(s) selected
          </span>
          <div className="bulk-buttons">
            <button onClick={() => handleBulkToggleStatus('activate')} className="btn-bulk">
              Activate Selected
            </button>
            <button onClick={() => handleBulkToggleStatus('suspend')} className="btn-bulk">
              Suspend Selected
            </button>
            <button onClick={handleBulkDelete} className="btn-bulk btn-danger">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        Showing {currentQuestions.length} of {filteredQuestions.length} questions
        {searchTerm && <span> (filtered from {questions.length} total)</span>}
      </div>

      {/* Questions Table */}
      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="questions-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input
                  type="checkbox"
                  checked={selectedQuestions.length === currentQuestions.length && currentQuestions.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="col-type">Type</th>
              <th className="col-question">Question</th>
              <th className="col-course">Course</th>
              <th className="col-status">Status</th>
              <th className="col-stats">Stats</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentQuestions.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-results">
                  No questions found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              currentQuestions.map(question => (
                <tr key={question.id} className={selectedQuestions.includes(question.id) ? 'selected' : ''}>
                  <td className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleSelectQuestion(question.id)}
                    />
                  </td>
                  <td className="col-type">
                    <span className="type-badge">{questionTypes[question.cardType]}</span>
                  </td>
                  <td className="col-question">
                    <div className="question-preview">
                      {question.question.substring(0, 100)}
                      {question.question.length > 100 && '...'}
                    </div>
                  </td>
                  <td className="col-course">{getCourseTitle(question.courseId)}</td>
                  <td className="col-status">{getStatusBadge(question)}</td>
                  <td className="col-stats">
                    <div className="stats-mini">
                      <span title="Times reviewed">{question.timesReviewed || 0}×</span>
                      <span title="Correct rate" className="correct-rate">
                        {question.timesReviewed > 0
                          ? Math.round((question.timesCorrect / question.timesReviewed) * 100)
                          : 0}%
                      </span>
                    </div>
                  </td>
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button
                        onClick={() => handleToggleSuspended(question.id)}
                        className="btn-action"
                        title={question.isSuspended ? 'Unsuspend' : 'Suspend'}
                      >
                        {question.isSuspended ? '👁️' : '🙈'}
                      </button>
                      <button
                        onClick={() => handleEdit(question)}
                        className="btn-action"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="btn-action btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn-page"
          >
            Previous
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`btn-page-number ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn-page"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <QuestionModal
          courseId={editingQuestion?.courseId}
          question={editingQuestion}
          modules={[]}
          onClose={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
          onSave={async () => {
            await fetchData();
            setShowModal(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default QuestionManagement;
