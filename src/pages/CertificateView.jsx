import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCertificate, getAllAttempts, getAllGuestAttempts, getGuestId } from '../utils/storage';
import { generatePDF, generatePNG } from '../utils/certificate';
import Certificate from '../components/Certificate';
import './CertificateView.css';

export default function CertificateView() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [cert, setCert] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [backLink, setBackLink] = useState('/results');
  const certRef = useRef(null);

  useEffect(() => {
    async function loadCertData() {
      if (authLoading) return;

      const data = await getCertificate(id);
      setCert(data);

      if (data) {
        let attemptsMap = {};
        if (user) {
          attemptsMap = await getAllAttempts(user.id);
        } else {
          attemptsMap = await getAllGuestAttempts(getGuestId());
        }
        const attempt = Object.values(attemptsMap).find((a) => a.certificateId === id);
        if (attempt) {
          setBackLink(`/results/${attempt.attemptId}`);
        } else {
          setBackLink('/results');
        }
      }
    }

    loadCertData();
  }, [id, user, authLoading]);

  if (!cert) {
    return (
      <div className="certview-page">
        <div className="certview-container animate-fade-in-up text-center">
          <h2>Certificate Not Found</h2>
          <p>No certificate found with ID: {id}</p>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: 24 }}>
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    const el = document.getElementById('certificate-element');
    if (!el) return;
    setDownloading(true);
    try {
      await generatePDF(el, `${cert.certificateId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
    setDownloading(false);
  };

  const handleDownloadPNG = async () => {
    const el = document.getElementById('certificate-element');
    if (!el) return;
    setDownloading(true);
    try {
      await generatePNG(el, `${cert.certificateId}.png`);
    } catch (err) {
      console.error('PNG generation failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="certview-page">
      <div className="certview-container animate-fade-in-up">
        <div className="certview-header">
          <Link to={backLink} className="review-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.67 8H3.33M7.33 4L3 8l4.33 4" />
            </svg>
            Back to Results
          </Link>
          <h1>Your Certificate</h1>
          <p>Download your certificate of learning validation.</p>
        </div>

        {/* Certificate Preview */}
        <div className="certview-preview" ref={certRef}>
          <Certificate data={cert} />
        </div>

        {/* Download Actions */}
        <div className="certview-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleDownloadPDF}
            disabled={downloading}
            id="btn-download-pdf"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={handleDownloadPNG}
            disabled={downloading}
            id="btn-download-png"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PNG
          </button>
        </div>

        <div className="certview-id">
          <span className="certview-id-label">Certificate ID</span>
          <span className="certview-id-value">{cert.certificateId}</span>
        </div>
      </div>
    </div>
  );
}

