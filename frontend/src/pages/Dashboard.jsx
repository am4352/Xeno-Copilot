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

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-indigo animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10',
      borderColor: 'border-accent-cyan/20',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-accent-emerald',
      bg: 'bg-accent-emerald/10',
      borderColor: 'border-accent-emerald/20',
    },
    {
      label: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: Megaphone,
      color: 'text-accent-violet',
      bg: 'bg-accent-violet/10',
      borderColor: 'border-accent-violet/20',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome to your marketing command center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`glass-card animate-fade-in delay-${i + 1}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-accent-emerald" />
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm text-text-secondary mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/upload"
          className="glass-card group flex items-center gap-4 animate-fade-in delay-4"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Upload Data</h3>
            <p className="text-sm text-text-secondary">Import customers & orders via CSV</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-indigo group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/audience"
          className="glass-card group flex items-center gap-4 animate-fade-in delay-5"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/10 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Build Audience</h3>
            <p className="text-sm text-text-secondary">Use AI to segment your customers</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent-indigo group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Campaigns */}
      {stats?.recentCampaigns?.length > 0 && (
        <div className="animate-fade-in delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Recent Campaigns</h2>
            <Link
              to="/analytics"
              className="text-sm text-accent-indigo hover:text-accent-violet transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="!text-text-primary font-medium">{campaign.name}</td>
                    <td>
                      <span className="capitalize">{campaign.channel}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{campaign.totalSent}</td>
                    <td className="!text-accent-emerald">{campaign.delivered}</td>
                    <td className="!text-accent-rose">{campaign.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!stats?.recentCampaigns || stats.recentCampaigns.length === 0) && (
        <div className="glass-card text-center py-12 animate-fade-in delay-3">
          <span className="text-5xl block mb-4">🚀</span>
          <h3 className="text-xl font-bold text-text-primary mb-2">No campaigns yet</h3>
          <p className="text-text-secondary mb-6">Start by uploading your customer data, then build your first audience</p>
          <Link to="/upload" className="btn-primary">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
