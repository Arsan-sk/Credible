import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const isQuizActive = location.pathname === '/quiz';

  // Hide header during quiz for distraction-free experience
  if (isQuizActive) return null;

  const username = profile?.username || user?.email?.split('@')[0] || 'U';
  const firstLetter = username.charAt(0);

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
          <Link to="/verify" className="header-link" id="nav-verify">
            Verify Certificate
          </Link>
          {user ? (
            <>
              <Link to="/history" className="header-link" id="nav-history">
                History
              </Link>
              <Link to="/profile" className="header-avatar" title="View Profile" id="nav-profile">
                {firstLetter}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link" id="nav-login">
                Log In
              </Link>
              <Link to="/register" className="header-link-btn" id="nav-register">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

