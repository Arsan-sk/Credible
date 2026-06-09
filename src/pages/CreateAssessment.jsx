import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { saveQuiz, clearQuizState } from '../utils/storage';
import BrickBreaker from '../components/BrickBreaker';
import './CreateAssessment.css';

export default function CreateAssessment() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Form fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDomain, setVideoDomain] = useState('');
  const [targetLevel, setTargetLevel] = useState('Intermediate');
  const [language, setLanguage] = useState('English');
  const [apiKeyId, setApiKeyId] = useState('');
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  
  // Job processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('queued'); // queued, processing, completed, failed
  const [errorMessage, setErrorMessage] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [formError, setFormError] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load API keys
  useEffect(() => {
    async function loadKeys() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('id, key_name, key_preview, provider, selected_model, use_same_model, agent1_model, agent2_model')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setApiKeys(data || []);
        if (data && data.length > 0) {
          setApiKeyId(data[0].id);
        }
      } catch (err) {
        console.error('Error loading API keys:', err);
      } finally {
        setKeysLoading(false);
      }
    }
    loadKeys();
  }, [user]);

  // Status Polling Effect
  useEffect(() => {
    if (!isGenerating || !jobId) return;

    let pollInterval = setInterval(async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data?.session?.access_token;
        if (!token) throw new Error('No active session.');

        const res = await fetch(`/api/generation-jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch job status');
        }

        const data = await res.json();
        setJobStatus(data.status);

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setGeneratedQuiz(data.quizData);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setErrorMessage(data.errorMessage || 'Unknown generation error occurred.');
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(pollInterval);
        setJobStatus('failed');
        setErrorMessage(err.message || 'Error occurred while checking status.');
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [isGenerating, jobId]);

  if (authLoading || !user) {
    return (
      <div className="create-assessment-page">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          Verifying session...
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const title = videoTitle.trim();
    const url = videoUrl.trim();
    const domain = videoDomain.trim();
    
    if (!title || !url || !domain || !apiKeyId) {
      setFormError('Please fill in all required fields and select an API key.');
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      if (!token) throw new Error('Authentication session not found. Please log in again.');

      const response = await fetch('/api/generate-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoTitle: title,
          videoUrl: url,
          videoDomain: domain,
          targetLevel,
          language,
          apiKeyId
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to start generation job.');
      }

      setJobId(resData.jobId);
      setJobStatus('queued');
      setErrorMessage(null);
      setGeneratedQuiz(null);
      setIsGenerating(true);
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.message || 'Failed to request assessment generation.');
    }
  };

  const handleStartQuiz = () => {
    if (!generatedQuiz) return;
    saveQuiz(generatedQuiz);
    clearQuizState();
    navigate('/assessment');
  };

  const handleCloseOverlay = () => {
    setIsGenerating(false);
    setJobId(null);
    setJobStatus('queued');
    setErrorMessage(null);
  };

  return (
    <div className="create-assessment-page">
      <div className="create-assessment-container animate-fade-in-up">
        <div className="create-assessment-header">
          <h1>Create Custom Assessment</h1>
          <p>Generate a certification quiz directly from educational video content using AI orchestration.</p>
        </div>

        {formError && (
          <div className="auth-alert auth-alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7" />
              <line x1="8" y1="10" x2="8" y2="10" />
              <line x1="8" y1="6" x2="8" y2="8" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-assessment-form">
          <div className="form-row">
            <div className="auth-group">
              <label className="auth-label" htmlFor="video-title">
                Video Title / Topic *
              </label>
              <input
                id="video-title"
                type="text"
                className="input"
                placeholder="e.g. Intro to Node.js Frameworks"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
                disabled={isGenerating}
              />
            </div>

            <div className="auth-group">
              <label className="auth-label" htmlFor="video-domain">
                Video Domain *
              </label>
              <input
                id="video-domain"
                type="text"
                className="input"
                placeholder="e.g. Programming, Finance, DevOps"
                value={videoDomain}
                onChange={(e) => setVideoDomain(e.target.value)}
                required
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="video-url">
              Video URL *
            </label>
            <input
              id="video-url"
              type="url"
              className="input"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              disabled={isGenerating}
            />
          </div>

          <div className="form-row">
            <div className="auth-group">
              <label className="auth-label" htmlFor="target-level">
                Target Certification Level
              </label>
              <select
                id="target-level"
                className="input select-input"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                disabled={isGenerating}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            <div className="auth-group">
              <label className="auth-label" htmlFor="language">
                Language
              </label>
              <input
                id="language"
                type="text"
                className="input"
                placeholder="English"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="api-key-select">
              Select Stored API Key *
            </label>
            {keysLoading ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading stored API keys...</p>
            ) : apiKeys.length === 0 ? (
              <div className="api-keys-missing-warning">
                <p>You have no API keys stored in your profile. You need to add a key first.</p>
                <Link to="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-xs)' }}>
                  Manage API Keys in Profile
                </Link>
              </div>
            ) : (
              <select
                id="api-key-select"
                className="input select-input"
                value={apiKeyId}
                onChange={(e) => setApiKeyId(e.target.value)}
                disabled={isGenerating}
                required
              >
                {apiKeys.map((key) => {
                  const prov = (key.provider || 'openrouter').toUpperCase();
                  let modelSummary = '';
                  if (!key.provider || key.provider === 'openrouter') {
                    modelSummary = key.use_same_model 
                      ? (key.selected_model || 'google/gemini-2.5-flash')
                      : 'Split Models';
                  } else {
                    modelSummary = key.provider === 'openai' ? 'gpt-4o' : key.provider === 'anthropic' ? 'claude-sonnet' : 'gemini-pro';
                  }
                  return (
                    <option key={key.id} value={key.id}>
                      {key.key_name} ({prov} - {modelSummary} - {key.key_preview})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <button
            id="btn-submit-generate"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isGenerating || keysLoading || apiKeys.length === 0 || !videoTitle.trim() || !videoUrl.trim() || !videoDomain.trim()}
            style={{ marginTop: 'var(--space-md)' }}
          >
            Generate Assessment
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1v14M1 8h14" />
            </svg>
          </button>
        </form>
      </div>

      {/* FULL-SCREEN GENERATION OVERLAY */}
      {isGenerating && (
        <div className="generation-overlay">
          <div className="generation-overlay-content animate-fade-in-up">
            <div className="generation-spinner-section">
              {jobStatus === 'completed' ? (
                <div className="success-icon animate-fade-in-up">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              ) : jobStatus === 'failed' ? (
                <div className="failed-icon animate-fade-in-up">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              ) : (
                <div className="loader-container">
                  <div className="generation-spinner" />
                </div>
              )}
              
              <h2 className="generation-title">
                {jobStatus === 'queued' && 'Assessment Queued...'}
                {jobStatus === 'processing' && 'Generating Your Assessment'}
                {jobStatus === 'completed' && 'Assessment Ready!'}
                {jobStatus === 'failed' && 'Generation Failed'}
              </h2>
              
              <p className="generation-subtitle">
                {jobStatus === 'queued' && 'Waiting to connect to API agents...'}
                {jobStatus === 'processing' && 'Analyzing educational content and building a validation assessment. This may take up to 2 minutes.'}
                {jobStatus === 'completed' && 'Your learning validation assessment has been successfully generated.'}
                {jobStatus === 'failed' && (errorMessage || 'An error occurred during assessment compilation.')}
              </p>
            </div>

            {/* Render Brick Breaker Game during loading */}
            {(jobStatus === 'processing' || jobStatus === 'queued') && (
              <div className="game-section">
                <p className="game-instructions">Break the bricks while the AI compiles your assessment quiz!</p>
                <BrickBreaker />
              </div>
            )}

            {/* Action buttons on finish */}
            {(jobStatus === 'completed' || jobStatus === 'failed') && (
              <div className="overlay-actions animate-fade-in-up" style={{ marginTop: 'var(--space-md)' }}>
                {jobStatus === 'completed' ? (
                  <button className="btn btn-primary btn-lg" onClick={handleStartQuiz} id="btn-overlay-start">
                    Start Assessment
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={handleCloseOverlay} id="btn-overlay-close">
                    Close & Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
