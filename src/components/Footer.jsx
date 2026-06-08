import { useLocation } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const isQuizActive = location.pathname === '/quiz';

  if (isQuizActive) return null;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-name">Credible</span>
          <span className="footer-tagline">AI Learning Validation Platform</span>
        </div>
      </div>
    </footer>
  );
}

