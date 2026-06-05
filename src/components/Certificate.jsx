import './Certificate.css';

export default function Certificate({ data }) {
  const {
    certificateId,
    userName,
    videoTitle,
    videoUrl,
    score,
    completionDate,
  } = data;

  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="certificate" id="certificate-element">
      <div className="cert-inner">
        {/* Top decorative line */}
        <div className="cert-top-line" />

        {/* Header */}
        <div className="cert-header">
          <div className="cert-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Credible</span>
          </div>
        </div>

        {/* Title */}
        <div className="cert-title-section">
          <h1 className="cert-title">Certificate of Learning Validation</h1>
          <div className="cert-divider" />
        </div>

        {/* Body */}
        <div className="cert-body">
          <p className="cert-preamble">This certifies that</p>
          <h2 className="cert-name">{userName}</h2>
          <p className="cert-achievement">
            has successfully demonstrated knowledge proficiency in
          </p>
          <h3 className="cert-course">{videoTitle || 'AI Learning Assessment'}</h3>
          {videoUrl && (
            <p className="cert-source">Source: {videoUrl}</p>
          )}
        </div>

        {/* Score & Date */}
        <div className="cert-details">
          <div className="cert-detail">
            <span className="cert-detail-label">Score Achieved</span>
            <span className="cert-detail-value">{score}%</span>
          </div>
          <div className="cert-detail">
            <span className="cert-detail-label">Date of Completion</span>
            <span className="cert-detail-value">{formattedDate}</span>
          </div>
          <div className="cert-detail">
            <span className="cert-detail-label">Certificate ID</span>
            <span className="cert-detail-value cert-id">{certificateId}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="cert-footer">
          <div className="cert-verify-note">
            Verify at credible.app/verify
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="cert-bottom-line" />
      </div>
    </div>
  );
}
