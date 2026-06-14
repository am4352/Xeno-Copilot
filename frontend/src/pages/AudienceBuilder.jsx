import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Sparkles,
  Search,
  Users,
  DollarSign,
  ArrowRight,
  Loader2,
  Megaphone,
  Zap,
  XCircle,
} from 'lucide-react';

export default function AudienceBuilder() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const examplePrompts = [
    'Find customers who spent more than ₹5000',
    "Customers who haven't purchased in 60 days",
    'High-value customers from Mumbai with more than 3 orders',
    'Inactive customers who spent less than ₹1000',
  ];

  const handleSegment = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/segment', { prompt });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to build audience.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns', {
      state: {
        audienceFilters: result.filters,
        audienceSize: result.audienceSize,
        audienceDescription: prompt,
      },
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#FFF7ED', border: '1px solid #FDE68A',
          borderRadius: '999px', padding: '4px 14px',
          fontSize: '11px', fontWeight: '600', color: '#B45309',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          <Zap style={{ width: '11px', height: '11px' }} />
          AI-Powered Segmentation
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Audience Builder
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
          Describe your target audience in plain English — AI will find them for you.
        </p>
      </div>

      {/* Prompt card */}
      <form onSubmit={handleSegment}>
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: '1.25rem',
        }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#4F46E5' }} />
            </div>
            <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>AI Audience Finder</span>
          </div>

          {/* Textarea */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          placeholder={"Try: \"Find customers who spent more than ₹5000 and haven't purchased in 60 days\""}
            style={{
              width: '100%', minHeight: '110px',
              border: '1px solid #E5E7EB', borderRadius: '10px',
              padding: '12px 14px', fontSize: '0.9rem', color: '#111827',
              background: '#FAFAFA', resize: 'vertical', outline: 'none',
              fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#4F46E5'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: loading || !prompt.trim() ? '#9CA3AF' : '#D97706',
                color: '#FFFFFF', fontWeight: '600', fontSize: '0.875rem',
                padding: '9px 20px', borderRadius: '999px', border: 'none',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading && prompt.trim()) e.currentTarget.style.background = '#B45309'; }}
              onMouseLeave={e => { if (!loading && prompt.trim()) e.currentTarget.style.background = '#D97706'; }}
            >
              {loading
                ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Finding audience...</>
                : <><Search style={{ width: '15px', height: '15px' }} /> Build Audience</>
              }
            </button>

            {result && (
              <button
                type="button"
                onClick={handleCreateCampaign}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: '#FFFFFF', color: '#2563EB', fontWeight: '600', fontSize: '0.875rem',
                  padding: '9px 20px', borderRadius: '999px',
                  border: '1.5px solid #BFDBFE', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <Megaphone style={{ width: '15px', height: '15px' }} />
                Create Campaign
                <ArrowRight style={{ width: '13px', height: '13px' }} />
              </button>
            )}
          </div>

          {/* Example prompts */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Try an example
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  style={{
                    fontSize: '0.78rem', padding: '5px 12px', borderRadius: '999px',
                    background: '#F9FAFB', border: '1px solid #E5E7EB',
                    color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F46E5'; e.currentTarget.style.color = '#4F46E5'; e.currentTarget.style.background = '#EEF2FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = '#F9FAFB'; }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '12px',
          background: '#FEF2F2', border: '1px solid #FECACA',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem',
        }}>
          <XCircle style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#B91C1C' }}>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* AI Parsed Filters */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB',
            borderRadius: '16px', padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
              </div>
              <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.875rem' }}>AI-Parsed Filters</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(result.filters).map(([key, value]) => (
                <span key={key} style={{
                  padding: '5px 12px', borderRadius: '8px',
                  background: '#EEF2FF', border: '1px solid #C7D2FE',
                  fontSize: '0.8rem', color: '#4338CA',
                }}>
                  <strong>{key}:</strong> {String(value)}
                </span>
              ))}
              {Object.keys(result.filters).length === 0 && (
                <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                  No specific filters detected — showing all customers
                </span>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #BFDBFE',
              borderRadius: '14px', padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users style={{ width: '20px', height: '20px', color: '#2563EB' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                    {result.audienceSize}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, fontWeight: '500' }}>Audience Size</p>
                </div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF', border: '1px solid #BBF7D0',
              borderRadius: '14px', padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign style={{ width: '20px', height: '20px', color: '#16A34A' }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                    ₹{result.avgSpend.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, fontWeight: '500' }}>Avg. Spend</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview table */}
          {result.preview?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Audience Preview
                </p>
                <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                  showing {result.preview.length} of {result.audienceSize}
                </span>
              </div>

              <div style={{
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: '14px', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                      {['Name', 'Email', 'City', 'Orders', 'Total Spent'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: '600', color: '#9CA3AF',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((customer, idx) => (
                      <tr
                        key={customer.id}
                        style={{ borderBottom: idx < result.preview.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '11px 16px', fontWeight: '600', color: '#111827' }}>{customer.name}</td>
                        <td style={{ padding: '11px 16px', color: '#6B7280' }}>{customer.email}</td>
                        <td style={{ padding: '11px 16px', color: '#6B7280' }}>{customer.city || '—'}</td>
                        <td style={{ padding: '11px 16px', color: '#374151' }}>{customer.orderCount}</td>
                        <td style={{ padding: '11px 16px', color: '#16A34A', fontWeight: '600' }}>
                          ₹{customer.totalSpent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}