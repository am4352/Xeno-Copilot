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
} from 'lucide-react';

export default function AudienceBuilder() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const examplePrompts = [
    'Find customers who spent more than ₹5000',
    'Customers who haven\'t purchased in 60 days',
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
    // Navigate to campaign builder with audience data
    navigate('/campaigns', {
      state: {
        audienceFilters: result.filters,
        audienceSize: result.audienceSize,
        audienceDescription: prompt,
      },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Audience Builder</h1>
        <p className="text-text-secondary mt-1">
          Describe your target audience in plain English — AI will find them for you
        </p>
      </div>

      {/* Prompt Input */}
      <form onSubmit={handleSegment} className="glass-card animate-fade-in delay-1">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent-indigo" />
          <span className="font-semibold text-text-primary">AI Audience Finder</span>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input !min-h-[120px] !pr-4"
            placeholder={"Try: \"Find customers who spent more than ₹5000 and haven't purchased in 60 days\""}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                Build Audience
              </>
            )}
          </button>
          {result && (
            <button
              type="button"
              onClick={handleCreateCampaign}
              className="btn-secondary"
            >
              <Megaphone className="w-4 h-4" />
              Create Campaign
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Example prompts */}
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-text-muted mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="text-xs px-3 py-1.5 rounded-full bg-bg-card border border-border text-text-secondary hover:text-accent-indigo hover:border-accent-indigo/30 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20 text-accent-rose text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Parsed Filters */}
          <div className="glass-card">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-violet" />
              AI-Parsed Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.filters).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-sm text-accent-indigo"
                >
                  <span className="font-medium">{key}:</span> {String(value)}
                </span>
              ))}
              {Object.keys(result.filters).length === 0 && (
                <span className="text-sm text-text-muted">No specific filters detected — showing all customers</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card !p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent-cyan" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{result.audienceSize}</p>
                  <p className="text-xs text-text-secondary">Audience Size</p>
                </div>
              </div>
            </div>
            <div className="glass-card !p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-emerald/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-emerald" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">₹{result.avgSpend.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary">Avg. Spend</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview table */}
          {result.preview?.length > 0 && (
            <div>
              <h3 className="font-semibold text-text-primary mb-3">
                Audience Preview <span className="text-text-muted font-normal">(showing {result.preview.length} of {result.audienceSize})</span>
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((customer) => (
                      <tr key={customer.id}>
                        <td className="!text-text-primary font-medium">{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.city || '—'}</td>
                        <td>{customer.orderCount}</td>
                        <td className="!text-accent-emerald">₹{customer.totalSpent.toLocaleString()}</td>
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
