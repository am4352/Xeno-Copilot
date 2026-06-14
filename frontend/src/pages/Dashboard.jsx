import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Users,
  ShoppingCart,
  Megaphone,
  TrendingUp,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadStats() {
      try {
        const res = await api.get('/dashboard/stats');
        if (!ignore) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadStats();
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
        <Loader2 style={{ width: '2rem', height: '2rem', color: '#2563EB', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      accentColor: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      change: '+12.5%',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      accentColor: '#16A34A',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      change: '+8.2%',
    },
    {
      label: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: Megaphone,
      accentColor: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      change: '+3.1%',
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#FFF7ED', border: '1px solid #FDE68A',
          borderRadius: '999px', padding: '4px 14px',
          fontSize: '11px', fontWeight: '600', color: '#B45309',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem'
        }}>
          <Zap style={{ width: '11px', height: '11px' }} />
          Xeno Copilot · AI-Native Marketing CRM
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#6B7280', margin: 0 }}>
          Your marketing command center — manage agents, campaigns & audiences.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: '#FFFFFF',
              border: `1px solid ${card.borderColor}`,
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: card.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon style={{ width: '20px', height: '20px', color: card.accentColor }} />
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: '600', color: '#16A34A',
                  background: '#F0FDF4', padding: '2px 8px', borderRadius: '999px'
                }}>
                  {card.change}
                </span>
              </div>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', margin: '0 0 2px 0', letterSpacing: '-0.02em' }}>
                {card.value.toLocaleString()}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0, fontWeight: '500' }}>
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,119,6,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                📤
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0 0 2px 0', fontSize: '0.95rem' }}>Upload Data</h3>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>Import customers & orders via CSV</p>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: '#D1D5DB', flexShrink: 0 }} />
            </div>
          </Link>

          <Link to="/audience" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                🎯
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: '600', color: '#111827', margin: '0 0 2px 0', fontSize: '0.95rem' }}>Build Audience</h3>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>Use AI to segment your customers</p>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: '#D1D5DB', flexShrink: 0 }} />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Campaigns */}
      {stats?.recentCampaigns?.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '11px', fontWeight: '600', color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recent Campaigns
            </h2>
            <Link to="/analytics" style={{
              fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              View all <ArrowRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>

          <div style={{
            background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '14px',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
                  {['Campaign', 'Channel', 'Status', 'Sent', 'Delivered', 'Failed'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: '600', color: '#9CA3AF',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentCampaigns.map((campaign, idx) => (
                  <tr key={campaign.id} style={{
                    borderBottom: idx < stats.recentCampaigns.length - 1 ? '1px solid #F9FAFB' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{campaign.name}</td>
                    <td style={{ padding: '12px 16px', color: '#6B7280', textTransform: 'capitalize' }}>{campaign.channel}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                        ...(campaign.status === 'completed'
                          ? { background: '#F0FDF4', color: '#15803D' }
                          : campaign.status === 'running'
                            ? { background: '#EFF6FF', color: '#1D4ED8' }
                            : { background: '#F3F4F6', color: '#6B7280' }
                        )
                      }}>
                        {campaign.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{campaign.totalSent}</td>
                    <td style={{ padding: '12px 16px', color: '#16A34A', fontWeight: '600' }}>{campaign.delivered}</td>
                    <td style={{ padding: '12px 16px', color: '#DC2626', fontWeight: '600' }}>{campaign.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!stats?.recentCampaigns || stats.recentCampaigns.length === 0) && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px',
          padding: '4rem 2rem', textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
            No campaigns yet
          </h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '0 0 1.5rem 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
            Upload your customer data, then build your first AI-powered audience segment to get started.
          </p>
          <Link to="/upload" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#D97706', color: '#FFFFFF', fontWeight: '600',
            padding: '10px 22px', borderRadius: '999px', textDecoration: 'none',
            fontSize: '0.9rem', transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#B45309'}
            onMouseLeave={e => e.currentTarget.style.background = '#D97706'}
          >
            Get Started <ArrowRight style={{ width: '15px', height: '15px' }} />
          </Link>
        </div>
      )}
    </div>
  );
}
