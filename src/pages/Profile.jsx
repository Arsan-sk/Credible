import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import './Profile.css';

// Reusable Searchable Model Dropdown Component
function SearchableModelDropdown({ label, value, onChange, models, idPrefix }) {
  const [search, setSearch] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const filtered = models.filter(m =>
    m.id.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="searchable-dropdown-wrapper">
      <label className="auth-label" htmlFor={`${idPrefix}-search`}>{label}</label>
      <div className="searchable-dropdown-container">
        <input
          id={`${idPrefix}-search`}
          type="text"
          className="input search-input"
          placeholder="Search models... (e.g. llama, gemini)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow clicking options
            setTimeout(() => {
              setIsOpen(false);
              onChange(search);
            }, 200);
          }}
        />
        {isOpen && (
          <div className="searchable-dropdown-list">
            {filtered.length === 0 ? (
              <div className="searchable-dropdown-no-results">No models found</div>
            ) : (
              filtered.slice(0, 100).map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`searchable-dropdown-item ${value === model.id ? 'active' : ''}`}
                  onMouseDown={(e) => {
                    // Prevent blur from firing before click registers
                    e.preventDefault();
                  }}
                  onClick={() => {
                    onChange(model.id);
                    setSearch(model.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="model-item-name">{model.name}</span>
                  <span className="model-item-id">{model.id}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  
  // Provider Specific States
  const [provider, setProvider] = useState('openrouter');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash');
  const [agent1Model, setAgent1Model] = useState('meta-llama/llama-3.3-70b-instruct:free');
  const [agent2Model, setAgent2Model] = useState('meta-llama/llama-3.3-70b-instruct:free');
  const [useSameModel, setUseSameModel] = useState(true);
  
  const [openrouterModels, setOpenrouterModels] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch OpenRouter Models
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch('/api/openrouter-models');
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            const formatted = data.data.map(m => ({
              id: m.id,
              name: m.name || m.id
            }));
            setOpenrouterModels(formatted);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching OpenRouter models, using static fallback:', err);
      }
      
      // Rich static list of models as fallback
      setOpenrouterModels([
        { id: 'google/gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash (Free)' },
        { id: 'google/gemini-2.5-pro', name: 'Google: Gemini 2.5 Pro' },
        { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B Instruct (Free)' },
        { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
        { id: 'z-ai/glm-4.5-air', name: 'GLM 4.5 Air' },
        { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B Instruct' },
        { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o Mini' },
        { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o' },
        { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet' },
        { id: 'anthropic/claude-3-opus', name: 'Anthropic: Claude 3 Opus' }
      ]);
    }
    loadModels();
  }, []);

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    if (!user) return;
    setKeysLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_api_keys')
        .select('id, key_name, key_preview, created_at, provider, selected_model, agent1_model, agent2_model, use_same_model, status')
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
        p_provider: provider,
        p_selected_model: provider === 'openrouter' ? selectedModel : null,
        p_agent1_model: (provider === 'openrouter' && !useSameModel) ? agent1Model : null,
        p_agent2_model: (provider === 'openrouter' && !useSameModel) ? agent2Model : null,
        p_use_same_model: useSameModel
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
          <h2>API Keys Configuration</h2>
          <p>Securely configure and store your LLM provider API credentials. Keys are encrypted symmetrically at-rest in our database.</p>
        </div>

        <form onSubmit={handleCreateKey} className="api-key-form-vertical">
          <div className="form-row">
            <div className="auth-group" style={{ flex: 1 }}>
              <label className="auth-label" htmlFor="api-key-provider">Provider</label>
              <select
                id="api-key-provider"
                className="input select-input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={actionLoading}
              >
                <option value="openrouter">OpenRouter (Primary)</option>
                <option value="openai">OpenAI (gpt-4o)</option>
                <option value="anthropic">Anthropic (claude-sonnet)</option>
                <option value="gemini">Google Gemini (gemini-pro)</option>
              </select>
            </div>

            <div className="auth-group" style={{ flex: 2 }}>
              <label className="auth-label" htmlFor="api-key-name">Key Name</label>
              <input
                id="api-key-name"
                type="text"
                className="input"
                placeholder="e.g. My OpenRouter Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                disabled={actionLoading}
                required
              />
            </div>
          </div>

          <div className="auth-group">
            <label className="auth-label" htmlFor="api-key-value">Key Value</label>
            <input
              id="api-key-value"
              type="password"
              className="input"
              placeholder="Paste your provider API key here"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>

          {provider === 'openrouter' && (
            <div className="openrouter-config-section animate-fade-in">
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useSameModel}
                    onChange={(e) => setUseSameModel(e.target.checked)}
                    disabled={actionLoading}
                  />
                  <span>Use Same Model For Both Agents</span>
                </label>
              </div>

              {useSameModel ? (
                <SearchableModelDropdown
                  label="Selected Model"
                  value={selectedModel}
                  onChange={setSelectedModel}
                  models={openrouterModels}
                  idPrefix="selected-model"
                />
              ) : (
                <div className="form-row animate-fade-in">
                  <div style={{ flex: 1 }}>
                    <SearchableModelDropdown
                      label="Agent 1 Model"
                      value={agent1Model}
                      onChange={setAgent1Model}
                      models={openrouterModels}
                      idPrefix="agent1-model"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <SearchableModelDropdown
                      label="Agent 2 Model"
                      value={agent2Model}
                      onChange={setAgent2Model}
                      models={openrouterModels}
                      idPrefix="agent2-model"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            id="btn-add-api-key"
            type="submit"
            className="btn btn-primary"
            disabled={actionLoading || !newKeyName.trim() || !newKeyValue.trim()}
            style={{ alignSelf: 'flex-start', padding: '0 var(--space-xl)', height: '45px', marginTop: 'var(--space-xs)' }}
          >
            {actionLoading ? 'Saving...' : 'Add Configured Key'}
          </button>
        </form>

        <div className="api-keys-list-container">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Stored Keys & Configurations
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
                <div key={key.id} className="api-key-item animate-fade-in">
                  <div className="api-key-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="api-key-name">{key.key_name}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '1px 6px', textTransform: 'uppercase' }}>
                        {key.provider || 'openrouter'}
                      </span>
                      {key.status && (
                        <span className={`badge ${key.status === 'active' ? 'badge-success' : 'badge-ghost'}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                          {key.status}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="api-key-preview">{key.key_preview}</span>
                    </div>

                    <div className="api-key-config-summary">
                      {(!key.provider || key.provider === 'openrouter') ? (
                        key.use_same_model ? (
                          <span>Model: <code className="model-code">{key.selected_model || 'google/gemini-2.5-flash'}</code></span>
                        ) : (
                          <span>
                            Agent 1: <code className="model-code">{key.agent1_model || 'meta-llama/llama-3.3-70b-instruct:free'}</code> | 
                            Agent 2: <code className="model-code">{key.agent2_model || 'meta-llama/llama-3.3-70b-instruct:free'}</code>
                          </span>
                        )
                      ) : (
                        <span>Default Direct Routing ({key.provider === 'openai' ? 'gpt-4o' : key.provider === 'anthropic' ? 'claude-sonnet' : 'gemini-pro'})</span>
                      )}
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
