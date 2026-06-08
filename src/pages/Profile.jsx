import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    if (!user) return;
    setKeysLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_api_keys')
        .select('id, key_name, key_preview, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setApiKeys(data || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setKeysLoading(false);
    }
  }, [user]);

  // Handle redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      fetchApiKeys();
    }
  }, [user, loading, navigate, fetchApiKeys]);

  if (loading || !user) {
    return (
      <div className="profile-page">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  const handleCreateKey = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const name = newKeyName.trim();
    const val = newKeyValue.trim();

    if (!name || !val) {
      setError('Please fill in both key name and value.');
      return;
    }

    setActionLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('store_api_key', {
        p_key_name: name,
        p_key_value: val,
      });

      if (rpcError) throw rpcError;

      setSuccess(`API key "${name}" successfully created and encrypted.`);
      setNewKeyName('');
      setNewKeyValue('');
      fetchApiKeys();
    } catch (err) {
      console.error('Error saving API key:', err);
      setError(err.message || 'Failed to encrypt and store the API key.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to delete the API key "${keyName}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const { error: deleteError } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', keyId);

      if (deleteError) throw deleteError;

      setSuccess(`API key "${keyName}" deleted.`);
      fetchApiKeys();
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(err.message || 'Failed to delete the API key.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const username = profile?.username || user.email?.split('@')[0] || 'User';
  const firstLetter = username.charAt(0);

  return (
    <div className="profile-page animate-fade-in-up">
      <div className="profile-header-card">
        <div className="profile-user-info">
          <div className="profile-avatar-large">{firstLetter}</div>
          <div className="profile-meta">
            <h1>{username}</h1>
            <p>Member since {formatDate(profile?.created_at || user.created_at)}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleLogout} id="btn-profile-logout">
          Log Out
        </button>
      </div>

      {(error || success) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
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
          {success && (
            <div className="auth-alert auth-alert-success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 8l4 4 8-8" />
              </svg>
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      <div className="profile-section">
        <div className="profile-section-header">
          <h2>API Keys</h2>
          <p>Securely store and manage your third-party service API keys. They are encrypted at rest using industry-grade cryptography.</p>
        </div>

        <form onSubmit={handleCreateKey} className="api-key-form-inline">
          <div className="auth-group">
            <label className="auth-label" htmlFor="api-key-name">Key Name</label>
            <input
              id="api-key-name"
              type="text"
              className="input"
              placeholder="e.g. OpenAI Key, n8n webhook"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>
          <div className="auth-group">
            <label className="auth-label" htmlFor="api-key-value">Key Value</label>
            <input
              id="api-key-value"
              type="password"
              className="input"
              placeholder="Paste your key here"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>
          <button
            id="btn-add-api-key"
            type="submit"
            className="btn btn-primary"
            disabled={actionLoading || !newKeyName.trim() || !newKeyValue.trim()}
            style={{ height: '45px' }}
          >
            {actionLoading ? 'Saving...' : 'Add Key'}
          </button>
        </form>

        <div className="api-keys-list-container">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Stored Keys
          </h3>
          {keysLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="api-keys-empty">
              No API keys stored yet. Add one above to get started.
            </div>
          ) : (
            <div className="api-keys-list">
              {apiKeys.map((key) => (
                <div key={key.id} className="api-key-item">
                  <div className="api-key-details">
                    <span className="api-key-name">{key.key_name}</span>
                    <div>
                      <span className="api-key-preview">{key.key_preview}</span>
                    </div>
                    <span className="api-key-date">Added on {formatDate(key.created_at)}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-danger-ghost btn-sm"
                    onClick={() => handleDeleteKey(key.id, key.key_name)}
                    title="Delete key"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
