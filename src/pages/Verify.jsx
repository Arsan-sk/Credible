import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getCertificate } from '../utils/storage';
import { supabase } from '../utils/supabase';
import './Verify.css';
import './AssessmentEntry.css'; // Reuse assessment details & video card styles

export default function Verify() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');
  const targetId = pathId || queryId;

  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState(null); // null = not searched, object = found, false = not found
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add-on states for quiz specifications and attempt review
  const [quizDetails, setQuizDetails] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const fetchQuizAndAttemptData = async (cert) => {
    if (!cert) return;

    setQuizDetails(null);
    setAttemptId(null);

    // 1. Fetch attempt associated with this certificate to get attemptId for detailed results Link
    try {
      // Try user attempts table
      const { data: userAttempt } = await supabase
        .from('attempts')
        .select('id')
        .eq('certificate_id', cert.certificateId)
        .maybeSingle();

      if (userAttempt) {
        setAttemptId(userAttempt.id);
      } else {
        // Try guest attempts table
        const { data: guestAttempt } = await supabase
          .from('guest_attempts')
          .select('id')
          .eq('certificate_id', cert.certificateId)
          .maybeSingle();

        if (guestAttempt) {
          setAttemptId(guestAttempt.id);
        }
      }
    } catch (err) {
      console.error('Error fetching attempt by certificateId:', err);
    }

    // 2. Fetch quiz details (certification level, domain, estimated hours, scope, etc.)
    try {
      let quizData = null;

      // A. If user generated custom assessment
      if (cert.quizId && cert.quizId.startsWith('GEN-')) {
        const { data } = await supabase
          .from('user_assessments')
          .select('quiz_data')
          .eq('id', cert.quizId)
          .maybeSingle();

        if (data?.quiz_data) {
          quizData = data.quiz_data;
        }
      }

      // B. If not found or if system/featured, fetch from system_quizzes table
      if (!quizData && cert.quizId) {
        const isFeatured = cert.quizId === 'FEATURED-ASSESSMENT-001' || cert.quizId === 'featured';
        const { data } = await supabase
          .from('system_quizzes')
          .select('quiz_data')
          .eq('quiz_type', isFeatured ? 'featured' : 'current')
          .maybeSingle();

        if (data?.quiz_data) {
          quizData = data.quiz_data;
        }
      }

      // C. Fallbacks to APIs
      if (!quizData) {
        const isFeatured = cert.quizId === 'FEATURED-ASSESSMENT-001' || cert.quizId === 'featured';
        const res = await fetch(isFeatured ? '/api/guest-quiz' : '/api/quiz');
        if (res.ok) {
          quizData = await res.json();
        }
      }

      if (quizData) {
        setQuizDetails(quizData);
      }
    } catch (err) {
      console.error('Error fetching quiz details:', err);
    }
  };

  const handleVerify = async (idToVerify) => {
    const id = (idToVerify || inputId).trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setSearched(false);
    setQuizDetails(null);
    setAttemptId(null);
    try {
      const cert = await getCertificate(id);
      setResult(cert);
      if (cert) {
        await fetchQuizAndAttemptData(cert);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setResult(null);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  // Auto-verify if targetId is present in path or query parameters
  useEffect(() => {
    if (targetId) {
      setInputId(targetId);
      handleVerify(targetId);
    }
  }, [targetId]);

  const formattedDate = result?.completionDate
    ? new Date(result.completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Extract quiz metrics for details rendering
  const quizProfile = quizDetails?.assessment_profile || {};
  const difficultyRating = quizProfile.difficulty_rating || null;
  const displayCertLevel = quizDetails?.certification_level || quizDetails?.quiz_metadata?.certification_level || (difficultyRating ? difficultyRating.charAt(0).toUpperCase() + difficultyRating.slice(1) : null);
  const domain = quizDetails?.domain || quizDetails?.quiz_metadata?.domain || null;
  const questionsCount = quizDetails?.questions?.length || 0;
  const knowledgeScopeScore = quizProfile.knowledge_scope_score || null;
  const topicsCount = quizProfile.topics_count || null;
  const projectsCount = quizProfile.projects_count || null;
  const estimatedHours = quizProfile.estimated_learning_hours || null;
  const weight = quizProfile.assessment_weight || null;

  const videoUrl = result?.videoUrl || result?.video_url || quizProfile.source_video_url || quizDetails?.video_url || '';
  const videoTitle = result?.videoTitle || result?.video_title || quizProfile.source_video_title || quizDetails?.video_title || '';

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return null;
  };

  const thumbnailUrl = getYouTubeThumbnail(videoUrl);

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
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleVerify()}
              id="input-cert-id"
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleVerify()}
              disabled={!inputId.trim() || loading}
              id="btn-verify"
            >
              {loading ? 'Verifying...' : 'Verify'}
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

            {/* Add-on: Quiz Specifications Details Card */}
            {quizDetails && (
              <div className="assessment-info-card" style={{ marginTop: 'var(--space-lg)', textAlign: 'left' }}>
                {domain && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Domain</span>
                    <span className="assessment-info-value">{domain}</span>
                  </div>
                )}
                {displayCertLevel && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Certification Level</span>
                    <span className="assessment-info-value">{displayCertLevel}</span>
                  </div>
                )}
                {questionsCount > 0 && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Questions</span>
                    <span className="assessment-info-value">{questionsCount}</span>
                  </div>
                )}
                {knowledgeScopeScore !== null && knowledgeScopeScore !== undefined && knowledgeScopeScore > 0 && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Knowledge Scope</span>
                    <span className="assessment-info-value">{knowledgeScopeScore}%</span>
                  </div>
                )}
                {topicsCount !== null && topicsCount !== undefined && topicsCount > 0 && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Topics Count</span>
                    <span className="assessment-info-value">{topicsCount}</span>
                  </div>
                )}
                {projectsCount !== null && projectsCount !== undefined && projectsCount > 0 && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Projects Evaluated</span>
                    <span className="assessment-info-value">{projectsCount}</span>
                  </div>
                )}
                {estimatedHours !== null && estimatedHours !== undefined && estimatedHours > 0 && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Est. Learning Time</span>
                    <span className="assessment-info-value">{estimatedHours} hrs</span>
                  </div>
                )}
                {weight && (
                  <div className="assessment-info-row">
                    <span className="assessment-info-label">Assessment Scope</span>
                    <span className="assessment-info-value" style={{ textTransform: 'capitalize' }}>{weight}</span>
                  </div>
                )}
              </div>
            )}

            {/* Add-on: Video Course Card */}
            {videoUrl && (
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="assessment-video-card"
                style={{ marginTop: 'var(--space-md)', textAlign: 'left', display: 'flex' }}
              >
                <div className="assessment-video-thumbnail-container">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt="Video Thumbnail" 
                      className="assessment-video-thumbnail" 
                    />
                  ) : (
                    <div className="assessment-video-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="assessment-video-details">
                  <span className="assessment-video-tag">Source Video Course</span>
                  <h4 className="assessment-video-title">{videoTitle || 'Watch Preparation Video'}</h4>
                  <span className="assessment-video-action">
                    Watch & learn concepts first
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.33 8h9.34M8.67 4L13 8l-4.33 4" />
                    </svg>
                  </span>
                </div>
              </a>
            )}

            {/* Add-on: Bottom Action Buttons */}
            <div className="verify-result-actions">
              {attemptId && (
                <Link
                  to={`/review/${attemptId}`}
                  className="btn btn-secondary"
                  id="btn-verify-view-results"
                >
                  View Quiz Results
                </Link>
              )}
              <Link
                to={`/certificate/${result.certificateId}`}
                className="btn btn-primary"
                id="btn-verify-view-cert"
              >
                View Certificate
              </Link>
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
