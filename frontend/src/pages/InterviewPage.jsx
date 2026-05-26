import React, { useState } from 'react';
import { MessageSquare, Sparkles, Volume2, HelpCircle, ChevronDown, ChevronUp, Cpu, VolumeX } from 'lucide-react';
import api from '../services/api';

const InterviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([
    {
      category: 'Technical',
      question: 'How do you handle horizontal scalability and locks inside a Node.js microservices ecosystem?',
      suggestedAnswer: 'Leverage distributed locks using Redis (via Redlock algorithm) or relational database transactions with isolation levels. For high volume state syncs, offload tasks asynchronously using queuing grids like RabbitMQ or Amazon SQS, allowing decoupled microservices to achieve eventual consistency.',
      keyFocusPoints: ['Distributed locks', 'Redis Redlock', 'Eventual consistency', 'Queue buffering']
    },
    {
      category: 'HR',
      question: 'Tell me about a time you had to resolve a high-concurrency production bottleneck under a tight deadline.',
      suggestedAnswer: 'Describe a structured troubleshooting approach: First, establish tracing metrics (e.g. APM tools). Second, isolate the bottleneck (e.g. an unindexed query or blocked thread). Third, implement immediate solutions (indexing, caching via Redis). Relate all outcomes directly to measured percentages.',
      keyFocusPoints: ['Isolate bottlenecks', 'Caching layers', 'Stakeholder alignment']
    },
    {
      category: 'System Design',
      question: 'Design an endpoint throttling and rate-limiting system for public-facing API gateways.',
      suggestedAnswer: 'Implement rate limiting at the gateway level using a token bucket or sliding window log algorithm backed by Redis. Storing customer API key counts in Redis ensures sub-millisecond lookups while maintaining statelessness across scaled app servers.',
      keyFocusPoints: ['Sliding window algorithm', 'Stateless Redis storage', 'HTTP 429 exceptions']
    }
  ]);
  
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(null);

  // Web Speech Synthesis TTS helper
  const handleSpeak = (text, index) => {
    if ('speechSynthesis' in window) {
      if (isPlaying === index) {
        window.speechSynthesis.cancel();
        setIsPlaying(null);
      } else {
        window.speechSynthesis.cancel(); // cancel prior
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlaying(null);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(index);
      }
    } else {
      alert('Speech Synthesis API is not supported on this browser context.');
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-cyber-cyan" /> AI Interview Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
          Practice questions compiled dynamically based on missing skill parameters and customized project experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Helper guide panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Cpu size={16} className="text-cyber-cyan" /> Simulator Guide
          </h3>
          <p className="text-xs text-slate-400 font-light leading-relaxed">
            These questions are calibrated against the target role requirements. Review the focus points and listen to questions read aloud to simulate a real recruiter screening loop.
          </p>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Interview Tips</h4>
            <ul className="space-y-2 text-[10px] text-slate-400 leading-relaxed font-light list-disc pl-4">
              <li>Always structure behavioral answers using the STAR method (Situation, Task, Action, Result).</li>
              <li>Provide concrete metrics (e.g. throughput gains, latency drops) rather than generic explanations.</li>
              <li>Reference horizontal system designs and caching strategies when answering engineering queries.</li>
            </ul>
          </div>
        </div>

        {/* Questions canvas panel */}
        <div className="space-y-4 lg:col-span-2">
          {questions.map((q, idx) => (
            <div 
              key={idx}
              className={`glass-panel rounded-2xl border transition-all duration-300 ${
                expandedIndex === idx ? 'border-cyber-cyan/30 bg-cyber-cyan/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              
              {/* Card Title Header */}
              <div 
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-cyber-cyan font-mono uppercase tracking-wider">
                    {q.category}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-relaxed truncate max-w-sm md:max-w-md">{q.question}</h4>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent card toggling
                      handleSpeak(q.question, idx);
                    }}
                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Simulate Voice Prompt"
                  >
                    {isPlaying === idx ? <VolumeX size={14} className="text-cyber-rose" /> : <Volume2 size={14} />}
                  </button>
                  {expandedIndex === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {/* Collapsible details panel */}
              {expandedIndex === idx && (
                <div className="p-5 border-t border-white/5 space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-cyber-cyan uppercase tracking-wider font-semibold block">Suggested STAR Answer</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light font-sans">{q.suggestedAnswer}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Key evaluation parameters</span>
                    <div className="flex flex-wrap gap-2">
                      {q.keyFocusPoints.map((pt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-cyber-indigo/10 border border-cyber-indigo/20 text-[9px] font-mono text-cyber-indigo">
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default InterviewPage;
