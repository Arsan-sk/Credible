import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const input = email.trim();
    if (!input || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      let finalEmail = input;
      let isUsername = !input.includes('@');

      if (isUsername) {
        finalEmail = `${input.toLowerCase()}@credible.com`;
      }

      let { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password: password,
      });

      // Fallback for legacy users under the @credible.local domain
      if (isUsername && signInError && (signInError.message.includes('Invalid login credentials') || signInError.status === 400)) {
        const { data: fallbackData, error: fallbackError } = await supabase.auth.signInWithPassword({
          email: `${input.toLowerCase()}@credible.local`,
          password: password,
        });
        if (!fallbackError) {
          data = fallbackData;
          signInError = null;
        }
      }

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email/username or password.');
        }
        throw new Error(signInError.message);
      }

      if (data?.user) {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Credible account.</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="7" />
              <line x1="8" y1="10" x2="8" y2="10" />
              <line x1="8" y1="6" x2="8" y2="8" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-group">
            <label className="auth-label" htmlFor="login-email">
              Email Address or Username
            </label>
            <input
              id="login-email"
              type="text"
              className="input"
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading || !email.trim() || !password}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" id="link-to-register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
