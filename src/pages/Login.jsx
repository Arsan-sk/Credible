import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const syntheticEmail = `${trimmedUser}@credible.local`;
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password: password,
      });

      if (signInError) {
        // Customize Supabase default errors to username context
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid username or password.');
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
            <label className="auth-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="username"
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
            disabled={loading || !username.trim() || !password}
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
