import { useState } from 'react';
import { getCertificate } from '../utils/storage';
import './Verify.css';

export default function Verify() {
  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState(null); // null = not searched, object = found, false = not found
  const [searched, setSearched] = useState(false);

  const handleVerify = () => {
    const id = inputId.trim().toUpperCase();
    if (!id) return;
    const cert = getCertificate(id);
    setResult(cert);
    setSearched(true);
  };

  const formattedDate = result?.completionDate
    ? new Date(result.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="verify-page">
      <div className="verify-container animate-fade-in-up">
        <div className="verify-header">
          <svg className="verify-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1>Verify Certificate</h1>
          <p>Enter a certificate ID to verify its authenticity.</p>
        </div>

        <div className="verify-form">
          <div className="verify-input-group">
            <input
              type="text"
              className="input verify-input"
              placeholder="CERT-2026-X7B91K"
              value={inputId}
              onChange={(e) => {
                setInputId(e.target.value);
                setSearched(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              id="input-cert-id"
            />
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={!inputId.trim()}
              id="btn-verify"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Result */}
        {searched && result && (
          <div className="verify-result verify-found animate-fade-in-up">
            <div className="verify-result-icon verify-found-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="verify-result-title verify-found-title">Certificate Verified</h3>
            <p className="verify-result-subtitle">This certificate is valid and authentic.</p>

            <div className="verify-details">
              <div className="verify-detail-row">
                <span className="verify-detail-label">Candidate</span>
                <span className="verify-detail-value">{result.userName}</span>
              </div>
              <div className="verify-detail-row">
                <span className="verify-detail-label">Assessment</span>
                <span className="verify-detail-value">{result.videoTitle}</span>
              </div>
              <div className="verify-detail-row">
                <span className="verify-detail-label">Score</span>
                <span className="verify-detail-value">{result.score}%</span>
              </div>
              <div className="verify-detail-row">
                <span className="verify-detail-label">Date</span>
                <span className="verify-detail-value">{formattedDate}</span>
              </div>
              <div className="verify-detail-row">
                <span className="verify-detail-label">Status</span>
                <span className="verify-detail-value">
                  <span className="badge badge-success">Verified</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {searched && !result && (
          <div className="verify-result verify-not-found animate-fade-in-up">
            <div className="verify-result-icon verify-not-found-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="verify-result-title verify-not-found-title">Certificate Not Found</h3>
            <p className="verify-result-subtitle">
              No certificate found with this ID. Please check the ID and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
