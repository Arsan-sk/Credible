import { useState } from 'react';
import './ReviewItem.css';

export default function ReviewItem({ question, index, userAnswer }) {
  const [isOpen, setIsOpen] = useState(false);

  const correctOptions = question.options
    .filter((o) => o.is_correct)
    .map((o) => o.option);
  const userAns = userAnswer || [];
  const isSkipped = userAns.length === 0;
  const isCorrect =
    !isSkipped &&
    userAns.length === correctOptions.length &&
    [...userAns].sort().every((v, i) => v === [...correctOptions].sort()[i]);

  return (
    <div className={`review-item ${isOpen ? 'review-item-open' : ''}`}>
      <button
        className="review-item-header"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        id={`review-item-${index}`}
      >
        <span className={`review-status ${isSkipped ? 'review-skipped' : isCorrect ? 'review-correct' : 'review-wrong'}`}>
          {isSkipped ? '—' : isCorrect ? '✓' : '✗'}
        </span>
        <span className="review-question-text">
          {index + 1}. {question.question_text}
        </span>
        <svg className="review-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="review-body">
          <div className="review-options">
            {question.options.map((opt) => {
              const isCorr = opt.is_correct;
              const isUser = userAns.includes(opt.option);
              let className = 'review-opt';
              if (isCorr && isUser) className += ' review-opt-correct';
              else if (isCorr) className += ' review-opt-answer';
              else if (isUser) className += ' review-opt-wrong';

              return (
                <div key={opt.option} className={className}>
                  <span className="review-opt-letter">{opt.option}.</span>
                  <span className="review-opt-text">{opt.text}</span>
                  {isCorr && isUser && <span className="review-opt-tag tag-correct">✓ Correct</span>}
                  {isCorr && !isUser && <span className="review-opt-tag tag-answer">Correct Answer</span>}
                  {!isCorr && isUser && <span className="review-opt-tag tag-wrong">✗ Your Answer</span>}
                </div>
              );
            })}
          </div>

          {question.explanation && (
            <div className="review-explanation">
              <span className="review-explanation-label">Explanation</span>
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
