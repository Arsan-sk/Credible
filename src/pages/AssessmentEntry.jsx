import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadQuiz, saveUserName, loadUserName } from '../utils/storage';
import { PASSING_SCORE } from '../utils/quiz';
import { supabase } from '../utils/supabase';
import './AssessmentEntry.css';

export default function AssessmentEntry() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const q = loadQuiz();
    if (!q || !q.questions?.length) {
      navigate('/');
      return;
    }
    setQuiz(q);
  }, [navigate]);

  useEffect(() => {
    if (initialized) return;
    if (user) {
      const username = profile?.username || user.email?.split('@')[0] || '';
      if (username) {
        setName(username);
        setInitialized(true);
      }
    } else {
      setName(loadUserName());
      setInitialized(true);
    }
  }, [user, profile, initialized]);

  if (!quiz) return null;

  const questions = quiz.questions;
  const metadata = quiz.quiz_metadata || {};
  const title = quiz.assessment_profile?.assessment_title || quiz.assessment_profile?.source_video_title || quiz.title || quiz.video_title || metadata.title || 'AI Learning Assessment';
  const domain = quiz.domain || metadata.domain || null;
  const certLevel = quiz.certification_level || metadata.certification_level || null;

  const handleStart = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    saveUserName(trimmedName);

    // If logged in and the name was changed, sync to profiles in DB
    if (user && trimmedName !== (profile?.username || '')) {
      try {
        await supabase
          .from('profiles')
          .update({ username: trimmedName })
          .eq('id', user.id);

        await supabase.auth.updateUser({
          data: { username: trimmedName }
        });

        if (refreshProfile) {
          await refreshProfile();
        }
      } catch (err) {
        console.error('Error updating name on start assessment:', err);
      }
    }

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
            Name (Name needed on certificate)
          </label>
          <input
            id="input-name"
            type="text"
            className="input"
            placeholder="Enter your name (e.g. John Doe)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            autoFocus
          />
          <p className="assessment-name-note">
            This name will appear on your certificate if you pass. You can edit it to change how it is printed.
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

