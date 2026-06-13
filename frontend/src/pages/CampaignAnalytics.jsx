import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  BarChart3,
  Loader2,
  RefreshCcw,
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  XCircle,
  Megaphone,
} from 'lucide-react';

export default function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [campaignData, setCampaignData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch list of campaigns for dropdown
  useEffect(() => {
    let ignore = false;

    async function loadCampaigns() {
      try {
        const res = await api.get('/campaigns');
        if (ignore) return;

        setCampaigns(res.data.campaigns);
        if (res.data.campaigns.length > 0) {
          setSelectedId(res.data.campaigns[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
      } finally {
        if (!ignore) setLoadingList(false);
      }
    }

    loadCampaigns();

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch specific campaign data when selected
  useEffect(() => {
    if (!selectedId) return undefined;
    let ignore = false;

    async function loadCampaignData(showLoading = true) {
      if (showLoading) {
        await Promise.resolve();
        if (!ignore) setLoadingData(true);
      }

      try {
        const res = await api.get(`/campaigns/${selectedId}`);
        if (!ignore) setCampaignData(res.data.campaign);
      } catch (err) {
        console.error('Failed to fetch campaign data:', err);
      } finally {
        if (showLoading && !ignore) setLoadingData(false);
      }
    }

    loadCampaignData();

    // Poll for updates if campaign is sending or recent
    const interval = setInterval(() => {
      loadCampaignData(false);
    }, 3000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  if (loadingList) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-accent-indigo animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-accent-cyan" />
            Analytics
          </h1>
          <p className="text-text-secondary mt-1">Track campaign delivery and engagement</p>
        </div>

        {/* Campaign Selector */}
        <div className="w-full sm:w-72">
          <label className="label">Select Campaign</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setCampaignData(null);
              setSelectedId(e.target.value);
            }}
            className="input appearance-none bg-bg-card border-border hover:border-border-hover"
          >
            <option value="" disabled>Select a campaign...</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({new Date(c.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!campaigns.length ? (
        <div className="glass-card text-center py-16 animate-fade-in">
          <Megaphone className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No campaigns yet</h3>
          <p className="text-text-secondary">Create a campaign to see analytics.</p>
        </div>
      ) : loadingData ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-accent-indigo animate-spin" />
        </div>
      ) : campaignData ? (
        <div className="space-y-6 animate-fade-in delay-1">
          {/* Campaign Header */}
          <div className="glass-card flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{campaignData.name}</h2>
              <p className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                <span className="capitalize">{campaignData.channel}</span>
                <span>•</span>
                <span>{new Date(campaignData.created_at).toLocaleString()}</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`badge badge-${campaignData.status} mb-2`}>
                {campaignData.status === 'sending' && <RefreshCcw className="w-3 h-3 mr-1 animate-spin" />}
                {campaignData.status}
              </span>
              <p className="text-sm text-text-secondary">
                Audience: <span className="font-medium text-text-primary">{campaignData.stats.total}</span>
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Sent', value: campaignData.stats.sent + campaignData.stats.delivered + campaignData.stats.opened + campaignData.stats.clicked + campaignData.stats.failed, icon: Send, color: 'text-text-primary' },
              { label: 'Delivered', value: campaignData.stats.delivered + campaignData.stats.opened + campaignData.stats.clicked, icon: CheckCircle2, color: 'text-accent-emerald' },
              { label: 'Opened', value: campaignData.stats.opened + campaignData.stats.clicked, icon: Eye, color: 'text-accent-cyan' },
              { label: 'Clicked', value: campaignData.stats.clicked, icon: MousePointerClick, color: 'text-accent-violet' },
              { label: 'Failed', value: campaignData.stats.failed, icon: XCircle, color: 'text-accent-rose' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              const rate = campaignData.stats.total > 0 
                ? Math.round((stat.value / campaignData.stats.total) * 100) 
                : 0;

              return (
                <div key={stat.label} className="glass-card !p-4 flex flex-col items-center text-center animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Icon className={`w-6 h-6 mb-2 ${stat.color}`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
                  <div className="mt-2 w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${stat.color.replace('text-', 'bg-')}`} 
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-1">{rate}%</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Logs */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-text-primary mb-4">Delivery Log</h3>
            <div className="table-container max-h-96 overflow-y-auto">
              <table>
                <thead className="sticky top-0 bg-bg-secondary">
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Latest Status</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignData.communications.map((comm) => (
                    <tr key={comm.id}>
                      <td className="!text-text-primary">{comm.customer.name}</td>
                      <td>{comm.customer.email}</td>
                      <td>
                        <span className={`badge bg-transparent border 
                          ${comm.status === 'failed' ? 'text-accent-rose border-accent-rose/30' : 
                            comm.status === 'clicked' ? 'text-accent-violet border-accent-violet/30' :
                            comm.status === 'opened' ? 'text-accent-cyan border-accent-cyan/30' :
                            comm.status === 'delivered' ? 'text-accent-emerald border-accent-emerald/30' :
                            'text-text-secondary border-border'}
                        `}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="text-xs">
                        {comm.events.length > 0 
                          ? new Date(comm.events[comm.events.length - 1].created_at).toLocaleTimeString() 
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
