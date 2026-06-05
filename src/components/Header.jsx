import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const isQuizActive = location.pathname === '/quiz';

  // Hide header during quiz for distraction-free experience
  if (isQuizActive) return null;

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Credible</span>
        </Link>
        <nav className="header-nav">
          {/* <Link to="/history" className="header-link">
            History
          </Link> */}
          <Link to="/verify" className="header-link">
            Verify Certificate
          </Link>
        </nav>
      </div>
    </header>
  );
}
