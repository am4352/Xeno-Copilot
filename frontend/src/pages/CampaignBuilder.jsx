import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Megaphone,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  Users,
  Smartphone,
} from 'lucide-react';

export default function CampaignBuilder() {
  const location = useLocation();
  const navigate = useNavigate();

  // State from Audience Builder (if navigated from there)
  const initialAudienceFilters = location.state?.audienceFilters || {};
  const initialAudienceSize = location.state?.audienceSize || null;
  const initialAudienceDescription = location.state?.audienceDescription || '';

  const [name, setName] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [audienceDescription, setAudienceDescription] = useState(initialAudienceDescription);
  const [messageTemplate, setMessageTemplate] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMessage = async () => {
    if (!audienceDescription) {
      setError('Please provide an audience description to generate a message.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await api.post('/ai/message', {
        description: audienceDescription,
        channel,
      });
      setMessageTemplate(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate message.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name || !messageTemplate) {
      setError('Please provide a campaign name and message template.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await api.post('/campaigns', {
        name,
        audience_description: audienceDescription,
        audience_filters: initialAudienceFilters,
        message_template: messageTemplate,
        channel,
      });

      // Immediately send the campaign after creating it (for demo purposes)
      await api.post(`/campaigns/${res.data.campaign.id}/send`);

      navigate('/analytics');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign.');
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-accent-violet" />
          Campaign Builder
        </h1>
        <p className="text-text-secondary mt-1">
          Create and launch AI-powered marketing campaigns
        </p>
      </div>

      <form onSubmit={handleCreateCampaign} className="space-y-6">
        {/* Step 1: Basic Info */}
        <div className="glass-card animate-fade-in delay-1">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-indigo text-white text-xs flex items-center justify-center">1</span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Summer Sale - High Value"
                required
              />
            </div>
            <div>
              <label className="label">Channel</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="input !pl-11 appearance-none bg-bg-input"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Audience (Read-only if passed from builder) */}
        <div className="glass-card animate-fade-in delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent-indigo text-white text-xs flex items-center justify-center">2</span>
              Target Audience
            </h2>
            {initialAudienceSize !== null && (
              <span className="badge badge-completed flex items-center gap-1">
                <Users className="w-3 h-3" />
                {initialAudienceSize} Customers
              </span>
            )}
          </div>
          
          <div>
            <label className="label">Audience Description</label>
            <textarea
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              className="input !min-h-[80px]"
              placeholder="Who should receive this campaign?"
              readOnly={!!initialAudienceDescription}
            />
            {initialAudienceDescription && (
              <p className="text-xs text-text-muted mt-2">
                Audience is locked from the builder. Go back to change it.
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Message Content */}
        <div className="glass-card animate-fade-in delay-3">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-indigo text-white text-xs flex items-center justify-center">3</span>
            Message Content
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="label !mb-0">Message Template</label>
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={generating || !audienceDescription}
                className="btn-secondary !py-2 !px-4 !text-xs"
              >
                {generating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accent-violet" />
                    Auto-Generate with AI
                  </>
                )}
              </button>
            </div>
            
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-text-muted" />
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="input !pl-11 !min-h-[160px]"
                placeholder="Hi {{name}}, ..."
                required
              />
            </div>
            <p className="text-xs text-text-muted">
              Use <code className="bg-bg-primary px-1 rounded">{'{{name}}'}</code> to insert the customer's name.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20 text-accent-rose text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 animate-fade-in delay-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="btn-primary"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Launch Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
