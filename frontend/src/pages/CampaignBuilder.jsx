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
  const navigate = useNavigate(); // Fixed: was useNavigate, now correct

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
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-16 md:py-20">
      <div className="mb-12 sm:mb-16 md:mb-20">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary flex items-center gap-3">
          <Megaphone className="w-9 h-9 md:w-10 md:h-10 text-accent-violet" />
          Campaign Builder
        </h1>
        <p className="text-text-secondary mt-3 text-base md:text-lg">
          Create and launch AI-powered marketing campaigns
        </p>
      </div>

      <form onSubmit={handleCreateCampaign}>
        {/* Step 1: Basic Info */}
        <div className="glass-card animate-fade-in delay-1 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent-indigo text-white text-sm flex items-center justify-center">1</span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <label className="label mb-2 block font-medium">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full rounded-xl px-4 py-3"
                placeholder="e.g., Summer Sale - High Value"
                required
              />
            </div>
            <div>
              <label className="label mb-2 block font-medium">Channel</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="input !pl-11 appearance-none bg-bg-input w-full rounded-xl px-4 py-3"
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
        <div className="glass-card animate-fade-in delay-2 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl mb-12 sm:mb-16 md:mb-20">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-accent-indigo text-white text-sm flex items-center justify-center">2</span>
              Target Audience
            </h2>
            {initialAudienceSize !== null && (
              <span className="badge badge-completed flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm">
                <Users className="w-3.5 h-3.5" />
                {initialAudienceSize} Customers
              </span>
            )}
          </div>
          
          <div>
            <label className="label mb-2 block font-medium">Audience Description</label>
            <textarea
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              className="input !min-h-[100px] w-full rounded-xl px-4 py-3"
              placeholder="e.g., Find customers who spent more than ₹5000 and haven't purchased in 60 days"
              readOnly={!!initialAudienceDescription}
            />
            {initialAudienceDescription && (
              <p className="text-xs text-text-muted mt-3">
                Audience is locked from the builder. Go back to change it.
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Message Content */}
        <div className="glass-card animate-fade-in delay-3 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-accent-indigo text-white text-sm flex items-center justify-center">3</span>
            Message Content
          </h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end flex-wrap gap-4">
              <label className="label !mb-0 font-medium">Message Template</label>
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={generating || !audienceDescription}
                className="btn-secondary !py-2.5 !px-5 !text-sm rounded-xl"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-accent-violet" />
                    Auto-Generate with AI
                  </>
                )}
              </button>
            </div>
            
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
              <textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="input !pl-12 !min-h-[180px] w-full rounded-xl px-4 py-3"
                placeholder="Hi {{name}}, ..."
                required
              />
            </div>
            <p className="text-xs text-text-muted">
              Use <code className="bg-bg-primary px-2 py-0.5 rounded-md font-mono text-xs">{'{{name}}'}</code> to insert the customer's name.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-5 rounded-2xl bg-accent-rose/5 border-2 border-accent-rose/20 text-accent-rose text-sm mb-12 sm:mb-16">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-5 pt-6 animate-fade-in delay-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary px-8 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating}
            className="btn-primary px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Launch Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}