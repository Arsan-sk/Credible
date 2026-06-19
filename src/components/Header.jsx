import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isQuizActive = location.pathname === '/quiz';

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
        
        <button 
          className="header-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        <nav className={`header-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/verify" className="header-link" id="nav-verify">
            Verify Certificate
          </Link>
          {user ? (
            <>
              <Link to="/create-assessment" className="header-link" id="nav-create-assessment">
                Create Assessment
              </Link>
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

