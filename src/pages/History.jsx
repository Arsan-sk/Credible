import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllAttempts } from '../utils/storage';
import './History.css';

export default function History() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (authLoading) return;

      if (!user) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const data = await getAllAttempts(user.id);
        const sorted = Object.values(data).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAttempts(sorted);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user, authLoading, navigate]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="history-page">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          Loading assessment history...
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container animate-fade-in-up">
        <div className="history-header">
          <h1>Assessment History</h1>
          <p>Review all your previously attempted learning validation assessments.</p>
        </div>

        {attempts.length === 0 ? (
          <div className="history-empty animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="history-empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>No attempts recorded yet</h3>
            <p>You haven't completed any assessments yet. Get started by taking an active learning assessment.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {attempts.map((attempt, idx) => {
              const isFeatured = attempt.quizId === 'FEATURED-ASSESSMENT-001';
              const isUserGen = attempt.quizId && attempt.quizId.startsWith('GEN-');
              
              return (
                <div
                  key={attempt.attemptId}
                  className="history-card animate-fade-in-up"
                  style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                >
                  <div className="history-card-header">
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        {isFeatured ? (
                          <span className="badge badge-success animate-fade-in" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Featured Quiz</span>
                        ) : isUserGen ? (
                          <span className="badge badge-indigo animate-fade-in" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>User Generated</span>
                        ) : (
                          <span className="badge badge-ghost animate-fade-in" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>System Quiz</span>
                        )}
                      </div>
                      <h3 className="history-card-title">{attempt.title}</h3>
                      <span className="history-card-date">{formatDate(attempt.date)}</span>
                    </div>
                    <span className={`badge ${attempt.passed ? 'badge-success' : 'badge-error'}`}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>

                <div className="history-card-body">
                  <div className="history-metrics">
                    <div className="history-metric">
                      <span className="history-metric-val">{attempt.score}%</span>
                      <span className="history-metric-lbl">Score</span>
                    </div>
                    <div className="history-metric">
                      <span className="history-metric-val">{attempt.correct} / {attempt.total}</span>
                      <span className="history-metric-lbl">Correct Answers</span>
                    </div>
                  </div>
                  {attempt.videoUrl && (
                    <div className="history-source">
                      <span className="history-source-lbl">Video Source: </span>
                      <a href={attempt.videoUrl} target="_blank" rel="noopener noreferrer" className="history-source-link">
                        {attempt.videoUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div className="history-card-actions">
                  <Link to={`/results/${attempt.attemptId}`} className="btn btn-secondary btn-sm" id={`btn-results-${attempt.attemptId}`}>
                    View Results
                  </Link>
                  {attempt.passed && attempt.certificateId && (
                    <Link to={`/certificate/${attempt.certificateId}`} className="btn btn-primary btn-sm" id={`btn-certificate-${attempt.attemptId}`}>
                      View Certificate
                    </Link>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

