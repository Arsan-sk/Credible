import './OptionCard.css';

export default function OptionCard({ option, isSelected, isMulti, onSelect }) {
  return (
    <button
      type="button"
      className={`option-card ${isSelected ? 'option-card-selected' : ''}`}
      onClick={onSelect}
      id={`option-${option.option}`}
    >
      <span className={`option-indicator ${isMulti ? 'option-indicator-multi' : ''}`}>
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="option-letter">{option.option}</span>
      <span className="option-text">{option.text}</span>
    </button>
  );
}
