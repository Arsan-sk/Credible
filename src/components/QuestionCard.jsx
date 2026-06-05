import { getQuestionTypeLabel } from '../utils/quiz';
import './QuestionCard.css';

export default function QuestionCard({ question, index, total }) {
  const typeLabel = getQuestionTypeLabel(question.question_type);

  return (
    <div className="question-card animate-fade-in-up">
      <div className="question-meta">
        <span className="question-number">Question {index + 1}</span>
        <span className="question-type-badge">{typeLabel}</span>
        <span className={`question-diff-badge question-diff-${question.difficulty}`}>
          {question.difficulty}
        </span>
      </div>
      <h2 className="question-text">{question.question_text}</h2>
      {question.question_type === 'multi-select' && (
        <p className="question-hint">Select all answers that apply</p>
      )}
    </div>
  );
}
