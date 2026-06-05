import { useEffect, useRef } from 'react';
import './ScoreRing.css';

export default function ScoreRing({ percentage, passed }) {
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const circle = circleRef.current;
    const text = textRef.current;
    if (!circle || !text) return;

    // Animate the ring
    const offset = circumference - (percentage / 100) * circumference;
    const timer = setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 100);

    // Animate the counter
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      text.textContent = `${Math.round(percentage * ease)}%`;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" width="140" height="140" viewBox="0 0 140 140">
        <circle
          className="score-ring-bg"
          cx="70"
          cy="70"
          r={radius}
        />
        <circle
          ref={circleRef}
          className={`score-ring-fill ${passed ? 'score-ring-pass' : 'score-ring-fail'}`}
          cx="70"
          cy="70"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="score-ring-text">
        <span ref={textRef} className="score-ring-pct">0%</span>
        <span className="score-ring-label">Score</span>
      </div>
    </div>
  );
}
