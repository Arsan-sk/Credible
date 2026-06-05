import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  loadQuiz,
  loadQuizState,
  saveQuizState,
  loadUserName,
  saveCertificate,
  getAttempt,
  saveAttempt
} from '../utils/storage';
import { evaluateQuiz, PASSING_SCORE } from '../utils/quiz';
import { generateCertificateId } from '../utils/certificate';
import ScoreRing from '../components/ScoreRing';
import './Results.css';

export default function Results() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [certId, setCertId] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentAttemptId, setCurrentAttemptId] = useState(attemptId || null);

  useEffect(() => {
    if (attemptId) {
      // Historical attempt lookup
      const attempt = getAttempt(attemptId);
      if (!attempt) {
        navigate('/history');
        return;
      }
      setResults({
        total: attempt.total,
        correct: attempt.correct,
        wrong: attempt.wrong,
        skipped: attempt.skipped,
        percentage: attempt.score,
        passed: attempt.passed,
      });
      setCertId(attempt.certificateId);
      setUserName(attempt.userName);
    } else {
      // Current active quiz lookup
      const quiz = loadQuiz();
      const state = loadQuizState();
      const name = loadUserName();

      if (!quiz || !state || !state.finished) {
        navigate('/');
        return;
      }

      const evaluation = evaluateQuiz(quiz.questions, state.answers);
      setResults(evaluation);
      setUserName(name);

      // Check if attempt already saved for this run
      if (state.attemptId) {
        setCurrentAttemptId(state.attemptId);
        // Look up certificate for this saved attempt
        const attempt = getAttempt(state.attemptId);
        if (attempt) {
          setCertId(attempt.certificateId);
        }
      } else {
        // Save new attempt!
        const newAttemptId = `ATT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const title = quiz.title || quiz.video_title || quiz.quiz_metadata?.title || 'AI Learning Assessment';
        const videoUrl = quiz.video_url || quiz.quiz_metadata?.video_url || '';

        const newAttempt = {
          attemptId: newAttemptId,
          quizId: quiz.received_at,
          title,
          videoUrl,
          userName: name,
          date: new Date().toISOString(),
          score: evaluation.percentage,
          passed: evaluation.passed,
          total: evaluation.total,
          correct: evaluation.correct,
          wrong: evaluation.wrong,
          skipped: evaluation.skipped,
          certificateId: null,
          answers: state.answers,
          questions: quiz.questions,
        };

        saveAttempt(newAttempt);
        setCurrentAttemptId(newAttemptId);

        // Update active quiz state with this attemptId
        saveQuizState({
          ...state,
          attemptId: newAttemptId,
        });
      }
    }
  }, [attemptId, navigate]);

  if (!results) return null;

  const { total, correct, wrong, skipped, percentage, passed } = results;

  const handleGenerateCertificate = () => {
    const id = generateCertificateId();
    let title = 'AI Learning Assessment';
    let videoUrl = '';
    let quizId = '';
    const targetAttemptId = currentAttemptId;

    if (attemptId) {
      const attempt = getAttempt(attemptId);
      if (attempt) {
        title = attempt.title;
        videoUrl = attempt.videoUrl;
        quizId = attempt.quizId;
      }
    } else {
      const quiz = loadQuiz();
      if (quiz) {
        title = quiz.title || quiz.video_title || quiz.quiz_metadata?.title || 'AI Learning Assessment';
        videoUrl = quiz.video_url || quiz.quiz_metadata?.video_url || '';
        quizId = quiz.received_at;
      }
    }

    const cert = {
      certificateId: id,
      userName,
      videoTitle: title,
      videoUrl,
      score: percentage,
      completionDate: new Date().toISOString(),
      status: 'verified',
      quizId,
    };

    saveCertificate(cert);
    setCertId(id);

    // Update the attempt with the certificateId
    if (targetAttemptId) {
      const attempt = getAttempt(targetAttemptId);
      if (attempt) {
        attempt.certificateId = id;
        saveAttempt(attempt);
      }
    }
  };

  return (
    <div className="results-page">
      <div className="results-container animate-fade-in-up">
        {/* Score Display */}
        <div className="results-hero">
          <ScoreRing percentage={percentage} passed={passed} />
          <h1 className={`results-verdict ${passed ? 'results-pass' : 'results-fail'}`}>
            {passed ? 'Assessment Passed' : 'Assessment Not Passed'}
          </h1>
          <p className="results-message">
            {passed
              ? `Congratulations! You scored ${percentage}% — above the ${PASSING_SCORE}% passing threshold.`
              : `You scored ${percentage}%. A minimum of ${PASSING_SCORE}% is required to pass.`}
          </p>
        </div>

        {/* Stats */}
        <div className="results-stats">
          <div className="results-stat">
            <span className="results-stat-value">{total}</span>
            <span className="results-stat-label">Total</span>
          </div>
          <div className="results-stat">
            <span className="results-stat-value results-stat-correct">{correct}</span>
            <span className="results-stat-label">Correct</span>
          </div>
          <div className="results-stat">
            <span className="results-stat-value results-stat-wrong">{wrong}</span>
            <span className="results-stat-label">Wrong</span>
          </div>
          {skipped > 0 && (
            <div className="results-stat">
              <span className="results-stat-value results-stat-skipped">{skipped}</span>
              <span className="results-stat-label">Skipped</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="results-actions">
          <Link
            to={currentAttemptId ? `/review/${currentAttemptId}` : `/review`}
            className="btn btn-secondary btn-lg w-full"
            id="btn-detailed-results"
          >
            View Detailed Results
          </Link>

          {passed && !certId && (
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleGenerateCertificate}
              id="btn-generate-cert"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Generate Certificate
            </button>
          )}

          {certId && (
            <Link
              to={`/certificate/${certId}`}
              className="btn btn-primary btn-lg w-full"
              id="btn-view-cert"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              View Certificate
            </Link>
          )}

          <Link to="/" className="btn btn-ghost w-full" id="btn-return-home">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
