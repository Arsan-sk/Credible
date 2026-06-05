import './QuizProgress.css';

export default function QuizProgress({ current, total }) {
  const percentage = Math.round(((current + 1) / total) * 100);

  return (
    <div className="quiz-progress">
      <div className="quiz-progress-header">
        <span className="quiz-progress-label">
          Question {current + 1} of {total}
        </span>
        <span className="quiz-progress-pct">{percentage}%</span>
      </div>
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
