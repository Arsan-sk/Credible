import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUser = username.trim();

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedUser.length < 2 || trimmedUser.length > 50) {
      setError('Name must be between 2 and 50 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Register via Supabase Auth using native email/password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            username: trimmedUser,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message?.includes('Email signups are disabled') || signUpError.code === 'email_provider_disabled') {
          throw new Error('Email signups are disabled in your Supabase project. Please enable the Email provider and disable "Confirm email" in the Supabase Dashboard under Authentication -> Providers -> Email.');
        }
        throw new Error(signUpError.message);
      }

      if (data?.user) {
        navigate('/');
      } else {
        setError('Registration succeeded, but no session returned. Please log in.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join Credible and track your assessments.</p>
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

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-group">
            <label className="auth-label" htmlFor="register-email">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              className="input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="register-username">
              Name (Name needed on certificate)
            </label>
            <input
              id="register-username"
              type="text"
              className="input"
              placeholder="Enter your name (e.g. John Doe)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              autoComplete="name"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading || !email.trim() || !username.trim() || !password}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" id="link-to-login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
