import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadQuiz, loadQuizState, getAttempt, getGuestAttempt } from '../utils/storage';
import ReviewItem from '../components/ReviewItem';
import './DetailedReview.css';

export default function DetailedReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [backLink, setBackLink] = useState('/results');

  useEffect(() => {
    async function loadReviewData() {
      if (authLoading) return;

      if (attemptId) {
        const attempt = user ? await getAttempt(attemptId) : await getGuestAttempt(attemptId);
        if (!attempt) {
          navigate(user ? '/history' : '/');
          return;
        }
        setQuestions(attempt.questions || []);
        setAnswers(attempt.answers || {});
        setBackLink(`/results/${attemptId}`);
      } else {
        const q = loadQuiz();
        const state = loadQuizState();

        if (!q || !state || !state.finished) {
          navigate('/');
          return;
        }

        setQuestions(q.questions || []);
        setAnswers(state.answers || {});
        setBackLink('/results');
      }
    }

    loadReviewData();
  }, [attemptId, navigate, user, authLoading]);

  if (questions.length === 0) return null;

  return (
    <div className="review-page">
      <div className="review-container">
        <div className="review-header-section animate-fade-in-up">
          <Link to={backLink} className="review-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.67 8H3.33M7.33 4L3 8l4.33 4" />
            </svg>
            Back to Results
          </Link>
          <h1>Detailed Review</h1>
          <p>Review all {questions.length} questions and their correct answers.</p>
        </div>

        <div className="review-list animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {questions.map((q, i) => (
            <ReviewItem
              key={q.question_id}
              question={q}
              index={i}
              userAnswer={answers[q.question_id]}
            />
          ))}
        </div>

        <div className="review-footer animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link to={backLink} className="btn btn-secondary">
            Back to Results
          </Link>
          <Link to="/" className="btn btn-ghost">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

