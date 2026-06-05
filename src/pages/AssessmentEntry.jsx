import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadQuiz, saveUserName, loadUserName } from '../utils/storage';
import { PASSING_SCORE } from '../utils/quiz';
import './AssessmentEntry.css';

export default function AssessmentEntry() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadUserName());
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const q = loadQuiz();
    if (!q || !q.questions?.length) {
      navigate('/');
      return;
    }
    setQuiz(q);
  }, [navigate]);

  if (!quiz) return null;

  const questions = quiz.questions;
  const metadata = quiz.quiz_metadata || {};
  const title = quiz.title || quiz.video_title || metadata.title || 'AI Learning Assessment';
  const domain = quiz.domain || metadata.domain || null;
  const certLevel = quiz.certification_level || metadata.certification_level || null;

  const handleStart = () => {
    if (!name.trim()) return;
    saveUserName(name.trim());
    navigate('/quiz');
  };

  return (
    <div className="assessment-entry">
      <div className="assessment-container animate-fade-in-up">
        <div className="assessment-header">
          <h1>Assessment Details</h1>
          <p>Review the information below and enter your name to begin.</p>
        </div>

        <div className="assessment-info-card">
          <div className="assessment-info-row">
            <span className="assessment-info-label">Assessment</span>
            <span className="assessment-info-value">{title}</span>
          </div>
          {domain && (
            <div className="assessment-info-row">
              <span className="assessment-info-label">Domain</span>
              <span className="assessment-info-value">{domain}</span>
            </div>
          )}
          {certLevel && (
            <div className="assessment-info-row">
              <span className="assessment-info-label">Certification Level</span>
              <span className="assessment-info-value">{certLevel}</span>
            </div>
          )}
          <div className="assessment-info-row">
            <span className="assessment-info-label">Questions</span>
            <span className="assessment-info-value">{questions.length}</span>
          </div>
          <div className="assessment-info-row">
            <span className="assessment-info-label">Passing Score</span>
            <span className="assessment-info-value">{PASSING_SCORE}%</span>
          </div>
        </div>

        <div className="assessment-form">
          <label className="assessment-label" htmlFor="input-name">
            Full Name
          </label>
          <input
            id="input-name"
            type="text"
            className="input"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            autoFocus
          />
          <p className="assessment-name-note">
            This name will appear on your certificate if you pass.
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg w-full"
          disabled={!name.trim()}
          onClick={handleStart}
          id="btn-begin-assessment"
        >
          Start Assessment
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.33 8h9.34M8.67 4L13 8l-4.33 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
