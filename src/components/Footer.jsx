import { useLocation } from 'react-router-dom';
import { clearQuizData, clearCertificates, clearAttempts } from '../utils/storage';
import './Footer.css';

export default function Footer() {
  const location = useLocation();
  const isQuizActive = location.pathname === '/quiz';

  if (isQuizActive) return null;

  const handleClearQuiz = () => {
    if (window.confirm('Clear all quiz data? This will reset your current assessment progress.')) {
      clearQuizData();
      window.location.href = '/';
    }
  };

  const handleClearCerts = () => {
    if (window.confirm('Clear all certificates? This cannot be undone.')) {
      clearCertificates();
      alert('Certificates cleared.');
      window.location.reload();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all attempt history? This cannot be undone.')) {
      clearAttempts();
      alert('History cleared.');
      window.location.reload();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-name">Credible</span>
          <span className="footer-tagline">AI Learning Validation Platform</span>
        </div>
        <div className="footer-utils">
          <span className="footer-utils-label">Developer Utilities</span>
          <div className="footer-utils-actions">
            <button onClick={handleClearQuiz} className="footer-btn">
              Reset Quiz Data
            </button>
            <button onClick={handleClearCerts} className="footer-btn">
              Reset Certificates
            </button>
            {/* <button onClick={handleClearHistory} className="footer-btn">
              Reset History
            </button> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
