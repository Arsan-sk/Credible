import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadQuiz, loadQuizState, saveQuizState, loadUserName } from '../utils/storage';
import { isMultiSelect } from '../utils/quiz';
import QuizProgress from '../components/QuizProgress';
import QuestionCard from '../components/QuestionCard';
import OptionCard from '../components/OptionCard';
import './Quiz.css';

export default function Quiz() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const q = loadQuiz();
    const userName = loadUserName();

    if (!q || !q.questions?.length || !userName) {
      navigate('/');
      return;
    }

    setQuiz(q);

    // Restore state
    const saved = loadQuizState();
    if (saved && saved.quizId === q.received_at) {
      setCurrent(saved.current || 0);
      setAnswers(saved.answers || {});
    }
  }, [navigate]);

  const persistState = useCallback(
    (newCurrent, newAnswers) => {
      if (!quiz) return;
      saveQuizState({
        quizId: quiz.received_at,
        current: newCurrent,
        answers: newAnswers,
      });
    },
    [quiz]
  );

  if (!quiz) return null;

  const questions = quiz.questions;
  const total = questions.length;
  const question = questions[current];
  const qid = question.question_id;
  const selectedOptions = answers[qid] || [];
  const isMulti = isMultiSelect(question.question_type);
  const isLast = current === total - 1;
  const hasSelection = selectedOptions.length > 0;

  const handleSelect = (optionLetter) => {
    let newSelected;
    if (isMulti) {
      newSelected = selectedOptions.includes(optionLetter)
        ? selectedOptions.filter((o) => o !== optionLetter)
        : [...selectedOptions, optionLetter];
    } else {
      newSelected = [optionLetter];
    }

    const newAnswers = { ...answers, [qid]: newSelected };
    setAnswers(newAnswers);
    persistState(current, newAnswers);
  };

  const goNext = () => {
    if (isLast) {
      setShowConfirm(true);
      return;
    }
    const next = current + 1;
    setCurrent(next);
    persistState(next, answers);
  };

  const goPrev = () => {
    if (current > 0) {
      const prev = current - 1;
      setCurrent(prev);
      persistState(prev, answers);
    }
  };

  const handleSubmit = () => {
    // Save final state and navigate to results
    saveQuizState({
      quizId: quiz.received_at,
      current,
      answers,
      finished: true,
    });
    navigate('/results');
  };

  return (
    <div className="quiz-page">
      {/* Quiz Header */}
      <div className="quiz-topbar">
        <div className="quiz-topbar-inner">
          <span className="quiz-topbar-brand">Credible</span>
          <div className="quiz-topbar-progress">
            <QuizProgress current={current} total={total} />
          </div>
          <span className="quiz-topbar-counter">
            {current + 1} / {total}
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="quiz-content" key={qid}>
        <div className="quiz-content-inner">
          <QuestionCard question={question} index={current} total={total} />

          <div className="quiz-options">
            {question.options.map((opt) => (
              <OptionCard
                key={opt.option}
                option={opt}
                isSelected={selectedOptions.includes(opt.option)}
                isMulti={isMulti}
                onSelect={() => handleSelect(opt.option)}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="quiz-nav">
            {current > 0 && (
              <button className="btn btn-secondary" onClick={goPrev}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.67 8H3.33M7.33 4L3 8l4.33 4" />
                </svg>
                Previous
              </button>
            )}
            <button
              className="btn btn-primary quiz-nav-next"
              onClick={goNext}
              disabled={!hasSelection}
              id="btn-next-question"
            >
              {isLast ? 'Submit Assessment' : 'Next'}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.33 8h9.34M8.67 4L13 8l-4.33 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="quiz-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Submit Assessment</h3>
            <p>
              You've answered {Object.keys(answers).filter((k) => answers[k]?.length > 0).length} of{' '}
              {total} questions. Once submitted, you cannot change your answers.
            </p>
            <div className="quiz-modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                Review Answers
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} id="btn-confirm-submit">
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
