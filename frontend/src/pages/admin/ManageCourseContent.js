/**
 * ============================================
 * Manage Course Content & Questions Page
 * ============================================
 * Comprehensive UI for managing course modules, content, and questions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  adminCourseAPI,
  adminCourseModuleAPI,
  adminCourseContentAPI,
  adminCardAPI
} from '../../services/adminApi';
import ModuleModal from '../../components/admin/ModuleModal';
import ContentModal from '../../components/admin/ContentModal';
import QuestionModal from '../../components/admin/QuestionModal';
import './ManageCourseContent.css';

const ManageCourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [contents, setContents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules'); // modules, content, questions

  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const [editingModule, setEditingModule] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseRes, modulesRes, contentsRes, questionsRes] = await Promise.all([
        adminCourseAPI.getById(courseId),
        adminCourseModuleAPI.getByCourse(courseId),
        adminCourseContentAPI.getByCourse(courseId),
        adminCardAPI.getByCourse(courseId)
      ]);

      setCourse(courseRes.data.data);

      // Ensure we always set arrays
      setModules(Array.isArray(modulesRes.data.data) ? modulesRes.data.data : []);
      setContents(Array.isArray(contentsRes.data.data) ? contentsRes.data.data : []);

      // Questions might be in data.data.cards or data.data
      const questionData = questionsRes.data.data;
      if (Array.isArray(questionData?.cards)) {
        setQuestions(questionData.cards);
      } else if (Array.isArray(questionData)) {
        setQuestions(questionData);
      } else {
        setQuestions([]);
      }

      console.log('Loaded data:', {
        modules: modulesRes.data.data,
        contents: contentsRes.data.data,
        questions: questionData
      });
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load course data');
      // Reset to safe defaults on error
      setModules([]);
      setContents([]);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setShowModuleModal(true);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowModuleModal(true);
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module? All content and questions in this module will be unlinked.')) {
      return;
    }

    try {
      await adminCourseModuleAPI.delete(moduleId);
      await loadData();
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module');
    }
  };

  const handleAddContent = (moduleId = null) => {
    setEditingContent({ moduleId });
    setShowContentModal(true);
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setShowContentModal(true);
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Delete this content?')) {
      return;
    }

    try {
      await adminCourseContentAPI.delete(contentId);
      await loadData();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleAddQuestion = (moduleId = null) => {
    setEditingQuestion({ moduleId });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) {
      return;
    }

    try {
      await adminCardAPI.delete(questionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="manage-content-page">
        <div className="loading">Loading course data...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="manage-content-page">
        <div className="error">Course not found</div>
      </div>
    );
  }

  return (
    <div className="manage-content-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/courses')}>
          ← Back to Courses
        </button>
        <div className="header-content">
          <div className="course-info">
            <span className="course-icon">{course.icon}</span>
            <div>
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>
            </div>
          </div>
          <div className="course-stats">
            <div className="stat">
              <span className="stat-value">{modules.length}</span>
              <span className="stat-label">Modules</span>
            </div>
            <div className="stat">
              <span className="stat-value">{contents.length}</span>
              <span className="stat-label">Content</span>
            </div>
            <div className="stat">
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          📚 Modules
        </button>
        <button
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          📁 Content & Files
        </button>
        <button
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          ❓ Questions
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'modules' && (
          <ModulesTab
            modules={modules}
            onAdd={handleAddModule}
            onEdit={handleEditModule}
            onDelete={handleDeleteModule}
          />
        )}

        {activeTab === 'content' && (
          <ContentTab
            contents={contents}
            modules={modules}
            onAdd={handleAddContent}
            onEdit={handleEditContent}
            onDelete={handleDeleteContent}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            questions={questions}
            modules={modules}
            onAdd={handleAddQuestion}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
        )}
      </div>

      {/* Modals */}
      {showModuleModal && (
        <ModuleModal
          courseId={courseId}
          module={editingModule}
          onClose={() => setShowModuleModal(false)}
          onSave={loadData}
        />
      )}

      {showContentModal && (
        <ContentModal
          courseId={courseId}
          content={editingContent}
          modules={modules}
          onClose={() => setShowContentModal(false)}
          onSave={loadData}
        />
      )}

      {showQuestionModal && (
        <QuestionModal
          courseId={courseId}
          question={editingQuestion}
          modules={modules}
          onClose={() => setShowQuestionModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
};

// ============================================
// Modules Tab Component
// ============================================
const ModulesTab = ({ modules, onAdd, onEdit, onDelete }) => {
  return (
    <div className="modules-tab">
      <div className="tab-header">
        <h2>Course Modules</h2>
        <button className="btn-primary" onClick={onAdd}>
          + Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="empty-state">
          <p>No modules yet. Create your first module to organize your course content!</p>
          <button className="btn-primary" onClick={onAdd}>
            + Create First Module
          </button>
        </div>
      ) : (
        <div className="modules-list">
          {modules.map((module) => (
            <div key={module.id} className="module-card">
              <div className="module-icon">{module.icon}</div>
              <div className="module-info">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <div className="module-meta">
                  {module.estimatedDuration && (
                    <span className="duration">⏱️ {module.estimatedDuration} min</span>
                  )}
                  <span className="content-count">
                    {module.contents?.length || 0} items
                  </span>
                  <span className="question-count">
                    {module.questions?.length || 0} questions
                  </span>
                </div>
              </div>
              <div className="module-actions">
                <button className="btn-edit" onClick={() => onEdit(module)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(module.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Content Tab Component
// ============================================
const ContentTab = ({ contents, modules, onAdd, onEdit, onDelete }) => {
  const getContentIcon = (type) => {
    const icons = {
      video: '🎥',
      pdf: '📄',
      document: '📝',
      link: '🔗',
      image: '🖼️',
      audio: '🎵'
    };
    return icons[type] || '📁';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="content-tab">
      <div className="tab-header">
        <h2>Course Content & Files</h2>
        <button className="btn-primary" onClick={() => onAdd()}>
          + Add Content
        </button>
      </div>

      {contents.length === 0 ? (
        <div className="empty-state">
          <p>No content yet. Add videos, PDFs, or documents to enrich your course!</p>
          <button className="btn-primary" onClick={() => onAdd()}>
            + Add First Content
          </button>
        </div>
      ) : (
        <div className="content-list">
          {contents.map((content) => (
            <div key={content.id} className="content-card">
              <div className="content-icon">{getContentIcon(content.contentType)}</div>
              <div className="content-info">
                <h3>{content.title}</h3>
                <p>{content.description}</p>
                <div className="content-meta">
                  <span className="content-type">{content.contentType}</span>
                  {content.fileSize && (
                    <span className="file-size">{formatFileSize(content.fileSize)}</span>
                  )}
                  {content.module && (
                    <span className="module-badge">{content.module.title}</span>
                  )}
                  {content.isFree && <span className="free-badge">FREE</span>}
                </div>
              </div>
              <div className="content-actions">
                <button className="btn-edit" onClick={() => onEdit(content)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(content.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Questions Tab Component
// ============================================
const QuestionsTab = ({ questions, modules, onAdd, onEdit, onDelete }) => {
  const getQuestionTypeLabel = (type) => {
    const labels = {
      basic: 'Short Answer',
      multiple_choice: 'Multiple Choice',
      cloze: 'Fill in the Blanks',
      image: 'Picture Quiz'
    };
    return labels[type] || type;
  };

  const getQuestionTypeIcon = (type) => {
    const icons = {
      basic: '📝',
      multiple_choice: '☑️',
      cloze: '✍️',
      image: '🖼️'
    };
    return icons[type] || '❓';
  };

  return (
    <div className="questions-tab">
      <div className="tab-header">
        <h2>Practice Questions</h2>
        <button className="btn-primary" onClick={() => onAdd()}>
          + Add Question
        </button>
      </div>

      <div className="question-types-info">
        <div className="info-card">
          <span className="icon">📝</span>
          <div>
            <strong>Short Questions</strong>
            <p>Students type their answer</p>
          </div>
        </div>
        <div className="info-card">
          <span className="icon">✍️</span>
          <div>
            <strong>Fill in the Blanks</strong>
            <p>Complete the sentence</p>
          </div>
        </div>
        <div className="info-card">
          <span className="icon">☑️</span>
          <div>
            <strong>Multiple Choice</strong>
            <p>Select the correct answer</p>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions yet. Add practice questions to help students learn!</p>
          <button className="btn-primary" onClick={() => onAdd()}>
            + Add First Question
          </button>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <div className="question-type-icon">
                {getQuestionTypeIcon(question.cardType)}
              </div>
              <div className="question-info">
                <div className="question-header">
                  <span className="question-type-badge">
                    {getQuestionTypeLabel(question.cardType)}
                  </span>
                  {question.module && (
                    <span className="module-badge">{question.module.title}</span>
                  )}
                </div>
                <h3>{question.question}</h3>
                <p className="answer-preview">
                  <strong>Answer:</strong> {question.answer}
                </p>
                {question.hint && (
                  <p className="hint-preview">
                    <strong>Hint:</strong> {question.hint}
                  </p>
                )}
                {question.cardType === 'multiple_choice' && question.options && (
                  <div className="options-preview">
                    {question.options.map((opt, idx) => (
                      <span key={idx} className="option-badge">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="question-actions">
                <button className="btn-edit" onClick={() => onEdit(question)}>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(question.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="sm2-info">
        <div className="info-box">
          <h4>📊 SM-2 Spaced Repetition Algorithm</h4>
          <p>
            All questions use the SM-2 algorithm to optimize learning. Questions will appear
            to students based on their performance, ensuring efficient retention and mastery.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageCourseContent;
