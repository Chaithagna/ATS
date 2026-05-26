import React, { useState } from 'react';
import { Sparkles, Clipboard, Check, RefreshCw, Cpu, Edit3 } from 'lucide-react';
import api from '../services/api';

const ImprovementPage = () => {
  const [bulletText, setBulletText] = useState('');
  const [instruction, setInstruction] = useState('Optimize using Google X-Y-Z formula with strong metrics.');
  const [optimizedText, setOptimizedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetInstructions = [
    { label: 'Google X-Y-Z Metrics', desc: 'Accomplished [X] as measured by [Y] by doing [Z]', text: 'Optimize using Google X-Y-Z formula with strong metrics.' },
    { label: 'Highlight Tech Stack', desc: 'Emphasize dynamic framework and DB integration tokens', text: 'Explicitly emphasize tech stack details, databases, and microservices tools.' },
    { label: 'Inject Senior Leadership', desc: 'Highlight product roadmap design and team mentorship metrics', text: 'Structure to convey architectural ownership, team leadership, and mentorship footprint.' },
  ];

  const handleRewrite = async (e) => {
    e.preventDefault();
    if (!bulletText) return;

    setLoading(true);
    setOptimizedText('');
    setCopied(false);

    try {
      const res = await api.post('/analysis/rewrite', {
        bulletText,
        instruction
      });

      if (res.success) {
        // Simple typewriter simulated loop
        const text = res.optimizedText;
        let index = 0;
        const interval = setInterval(() => {
          setOptimizedText(prev => prev + text.charAt(index));
          index++;
          if (index >= text.length) {
            clearInterval(interval);
          }
        }, 12);
      }
    } catch (error) {
      console.error(error.message);
      setOptimizedText('[System Error] Failed to compute neural rewrite instructions. Please verify API settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (optimizedText) {
      navigator.clipboard.writeText(optimizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-cyber-cyan" /> AI Bullet Optimizer
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
          Transform generic task points into metric-rich achievements that stand out to ATS filters and tech recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Adjustment Parameters</h3>
          
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preset Instructions</h4>
            {presetInstructions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInstruction(item.text)}
                className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                  instruction === item.text 
                    ? 'border-cyber-cyan bg-cyber-cyan/5 text-white' 
                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="font-bold">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-light mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Custom Instructions</label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Structure to emphasize scalable database caching."
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Action Canvas panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-2">
          <form onSubmit={handleRewrite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Original Resume Snippet</label>
              <textarea
                rows={4}
                value={bulletText}
                onChange={(e) => setBulletText(e.target.value)}
                placeholder="e.g. I was responsible for writing APIs using express."
                required
                className="w-full px-4 py-3.5 rounded-xl glass-input text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !bulletText}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Commencing neural refactoring...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Optimize Sentence structure
                </>
              )}
            </button>
          </form>

          {/* Results Canvas */}
          {(optimizedText || loading) && (
            <div className="border border-white/5 rounded-2xl bg-[#090915] p-6 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-cyber-cyan flex items-center gap-1.5">
                  <Cpu size={14} className="animate-pulse" /> AI Refactoring Output
                </span>
                {optimizedText && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px] font-bold"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard size={12} /> Copy to Clipboard
                      </>
                    )}
                  </button>
                )}
              </div>

              {loading && !optimizedText ? (
                <div className="h-20 flex items-center justify-center text-xs text-slate-500 animate-pulse">
                  Assembling context and compiling syntax tokens...
                </div>
              ) : (
                <div className="text-sm font-medium text-slate-200 leading-relaxed font-mono min-h-[5rem] whitespace-pre-wrap">
                  {optimizedText}
                </div>
              )}

              {optimizedText && (
                <div className="text-[10px] text-slate-500 font-mono mt-4 flex items-center gap-1">
                  <Edit3 size={10} /> Directly copy-paste this version into your master resume layout.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ImprovementPage;
