import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchQuiz } from '../utils/api';
import { saveQuiz, loadQuiz, getAllAttempts } from '../utils/storage';
import { PASSING_SCORE } from '../utils/quiz';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizData() {
      // Try server first
      const serverQuiz = await fetchQuiz();
      if (serverQuiz) {
        saveQuiz(serverQuiz);
        setQuiz(serverQuiz);
      } else {
        // Fallback to localStorage
        const localQuiz = loadQuiz();
        if (localQuiz) setQuiz(localQuiz);
      }
      setAttempts(getAllAttempts());
      setLoading(false);
    }
    loadQuizData();
  }, []);

  const questions = quiz?.questions || [];
  const metadata = quiz?.quiz_metadata || {};
  const title = quiz?.title || quiz?.video_title || metadata?.title || null;
  const domain = quiz?.domain || metadata?.domain || null;
  const hasQuiz = questions.length > 0;

  // Check if this specific quiz was already attempted
  const isAttempted = hasQuiz && Object.values(attempts).some(
    (a) => a.quizId === quiz.received_at
  );

  return (
    <div className="landing">
      <div className="landing-container">
        {/* Hero */}
        <div className="landing-hero animate-fade-in-up">
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Learning Validation Platform
          </div>
          <h1 className="landing-headline">
            Learning From Videos Is Easy.
            <br />
            <span className="landing-headline-accent">Proving It Is Hard.</span>
          </h1>
          <p className="landing-subheadline">
            Validate knowledge from educational videos through AI-generated
            assessments and professional certificates.
          </p>
        </div>

        {/* Quiz Info, Attempted State, or Empty State */}
        {loading ? (
          <div className="landing-loading">
            <div className="landing-spinner" />
            <p>Checking for available assessments...</p>
          </div>
        ) : hasQuiz && !isAttempted ? (
          <>
            <div className="landing-quiz-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {title && <h3 className="landing-quiz-title">{title}</h3>}
              <div className="landing-quiz-stats">
                <div className="landing-stat">
                  <span className="landing-stat-value">{questions.length}</span>
                  <span className="landing-stat-label">Questions</span>
                </div>
                <div className="landing-stat">
                  <span className="landing-stat-value">{PASSING_SCORE}%</span>
                  <span className="landing-stat-label">Passing Score</span>
                </div>
                {domain && (
                  <div className="landing-stat">
                    <span className="landing-stat-value landing-stat-text">{domain}</span>
                    <span className="landing-stat-label">Domain</span>
                  </div>
                )}
                {metadata?.difficulty_distribution && (
                  <div className="landing-stat">
                    <span className="landing-stat-value landing-stat-text">
                      {Object.entries(metadata.difficulty_distribution)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => `${v} ${k}`)
                        .join(', ')}
                    </span>
                    <span className="landing-stat-label">Difficulty Mix</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="landing-actions animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/assessment')}
                id="btn-start-assessment"
              >
                Start Assessment
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.33 8h9.34M8.67 4L13 8l-4.33 4" />
                </svg>
              </button>
              {/* <Link to="/history" className="btn btn-secondary btn-lg" id="btn-view-history">
                View History
              </Link> */}
              <Link to="/verify" className="btn btn-secondary btn-lg" id="btn-verify-cert">
                Verify Certificate
              </Link>
            </div>
          </>
        ) : isAttempted ? (
          <>
            <div className="landing-completed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="landing-completed-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3>You're all caught up!</h3>
              <p>
                The latest assessment <strong>"{title}"</strong> has already been completed. Any new video analysis will appear here.
              </p>
            </div>

            {/* CTAs */}
            <div className="landing-actions animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {/* <Link to="/history" className="btn btn-primary btn-lg" id="btn-view-history">
                View Past Quizzes
              </Link> */}
              <Link to="/verify" className="btn btn-primary btn-lg" id="btn-verify-cert">
                Verify Certificate
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="landing-empty animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="landing-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>No assessment is currently available.</h3>
              <p>An assessment will appear here when a new quiz is sent from the learning pipeline.</p>
            </div>

            {/* CTAs */}
            <div className="landing-actions animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {/* <Link to="/history" className="btn btn-primary btn-lg" id="btn-view-history">
                View Past Quizzes
              </Link> */}
              <Link to="/verify" className="btn btn-primary btn-lg" id="btn-verify-cert">
                Verify Certificate
              </Link>
            </div>
          </>
        )}

        {/* Informational Sections */}
        <div className="landing-info animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="landing-section-divider" />
          
          <h2 className="landing-info-title">How Learning Validation Works</h2>
          <p className="landing-info-subtitle">Transform passive learning into verifiable credentials using our structured three-step AI pipeline.</p>
          
          <div className="landing-steps-grid">
            <div className="landing-step-card">
              <div className="landing-step-num">01</div>
              <h3>Curriculum Extraction</h3>
              <p>The AI workflow reviews the educational video, mapping out core concepts, key takeaways, and difficulty curves.</p>
            </div>
            
            <div className="landing-step-card">
              <div className="landing-step-num">02</div>
              <h3>Rigorous Assessment</h3>
              <p>An automated exam is generated, covering multiple difficulty levels, code outputs, and situational questions.</p>
            </div>
            
            <div className="landing-step-card">
              <div className="landing-step-num">03</div>
              <h3>Secure Validation</h3>
              <p>Achieve an 80% passing threshold to demonstrate proficiency and unlock a tamper-proof PDF/PNG certificate.</p>
            </div>
          </div>

          <div className="landing-features-section">
            <h2 className="landing-info-title">Features Designed for Validation</h2>
            <div className="landing-features-grid">
              <div className="landing-feature-item">
                <div className="landing-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 8 12 12 14 14" />
                  </svg>
                </div>
                <div>
                  <h4>Attempt Archives</h4>
                  <p>Your history tab stores all previous attempts, scores, questions, and explanations so you can review areas for improvement.</p>
                </div>
              </div>

              <div className="landing-feature-item">
                <div className="landing-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <h4>Multi-Format Testing</h4>
                  <p>Supports code snippet outputs, scenario-based case reviews, and multi-select formats to comprehensively check your knowledge.</p>
                </div>
              </div>

              <div className="landing-feature-item">
                <div className="landing-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 12a11 11 0 1 1-22 0 11 11 0 0 1 22 0z" />
                    <path d="M12 7v10M8 12h8" />
                  </svg>
                </div>
                <div>
                  <h4>State Persistence</h4>
                  <p>Refresh or navigate away during your test without losing your place. The local engine automatically caches your progress.</p>
                </div>
              </div>

              <div className="landing-feature-item">
                <div className="landing-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h4>Credential Security</h4>
                  <p>Each generated certificate is stamped with a unique signature hash that can be instantly verified in the portal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
