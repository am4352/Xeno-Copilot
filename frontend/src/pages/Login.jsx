import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent-indigo/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent-violet/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent-cyan/3 blur-3xl" />
      </div>

      {/* Left branding panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center px-12 relative">
        <div className="animate-fade-in max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center animate-float">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold gradient-text">Xeno Copilot</h1>
              <p className="text-text-secondary text-sm mt-1">AI-Native Marketing CRM</p>
            </div>
          </div>
          
          <p className="text-xl text-text-secondary leading-relaxed mb-10">
            Upload customer data, build audiences with natural language, generate personalized campaigns with AI, and track performance — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { emoji: '🎯', text: 'AI-Powered Audience Segmentation' },
              { emoji: '✨', text: 'Natural Language Campaign Builder' },
              { emoji: '📊', text: 'Real-Time Delivery Analytics' },
              { emoji: '📤', text: 'CSV Data Import & Management' },
            ].map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 glass-card !p-4 animate-fade-in delay-${i + 1}`}
              >
                <span className="text-2xl">{feature.emoji}</span>
                <span className="text-text-primary font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 relative z-10">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold gradient-text">Xeno Copilot</h1>
          </div>

          <div className="glass-card animate-pulse-glow">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-text-secondary text-sm mb-8">
              {isRegister
                ? 'Sign up to start building smart campaigns'
                : 'Sign in to your marketing dashboard'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input !pl-11"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input !pl-11"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="text-accent-rose text-sm bg-accent-rose/10 border border-accent-rose/20 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-sm text-text-secondary hover:text-accent-indigo transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
