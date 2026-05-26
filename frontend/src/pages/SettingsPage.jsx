import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, HelpCircle, Save, Database, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { user, updateSettings } = useAuth();
  const { changeTheme } = useTheme();
  
  const [geminiKey, setGeminiKey] = useState(user?.settings?.geminiKey || '');
  const [pineconeKey, setPineconeKey] = useState(user?.settings?.pineconeKey || '');
  
  const initialTheme = user?.settings?.theme === 'dark' ? 'aurora' : (user?.settings?.theme || 'aurora');
  const [theme, setTheme] = useState(initialTheme);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await updateSettings({
        theme,
        geminiKey,
        pineconeKey
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || 'Failed to sync API credentials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-cyber-cyan animate-spin-slow" /> Developer Credentials
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
          Link live vector indexes and generative LLM models, or operate inside sandbox fallback configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* API guides panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={16} className="text-cyber-cyan" /> Workspace info
          </h3>

          <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-light">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles size={12} className="text-cyber-cyan" /> Gemini Model Keys
              </h4>
              <p>Used to generate real-time metrics audit summaries, stronger Google X-Y-Z bullet points, and customized simulated interview preparatory questions.</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
              <h4 className="font-bold text-white uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Database size={12} className="text-cyber-indigo" /> Pinecone Vector DB
              </h4>
              <p>Used to store parsed resume vector representations and perform real-time semantic RAG retrievals on massive candidate databases.</p>
            </div>

            <div className="flex gap-2 items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-[10px]">
              <AlertCircle size={14} className="shrink-0" />
              <p>Leaving keys blank keeps the application running in <strong>Sandbox Mode</strong> utilizing local cosine matrices.</p>
            </div>
          </div>
        </div>

        {/* Credentials Editor form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Key size={16} className="text-cyber-cyan" /> Custom Endpoint Configs
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Google Gemini API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Pinecone DB API Key</label>
                <input
                  type="password"
                  placeholder="pcsk_..."
                  value={pineconeKey}
                  onChange={(e) => setPineconeKey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Display Theme Aura</label>
                <select
                  value={theme}
                  onChange={(e) => {
                    const selectedTheme = e.target.value;
                    setTheme(selectedTheme);
                    changeTheme(selectedTheme);
                  }}
                  className="w-full px-4 py-3 rounded-xl glass-input text-xs font-bold bg-slate-900 border border-white/10 text-white"
                >
                  <option value="aurora">Aurora Borealis (Teal-Indigo Fresh)</option>
                  <option value="sunset">Neon Sunset (Amber-Rose Fresh)</option>
                  <option value="prism">Cyberpunk Prism (Magenta-Teal Neon)</option>
                  <option value="matrix">Emerald Matrix (Classic Green Obsidian)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="text-xs text-cyber-rose bg-cyber-rose/10 border border-cyber-rose/20 p-3 rounded-xl text-center font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center font-bold flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} /> System synchronized successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Sync API Configuration
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
