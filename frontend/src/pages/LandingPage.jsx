import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Activity, 
  Search, 
  CornerDownRight, 
  FileCheck,
  Code2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background transition-colors duration-700">
      {/* Dynamic Animated Mesh Backdrops */}
      <div className="cyber-bg" />
      <div className="cyber-bg-glow-3" />

      {/* Navigation bar */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyber-cyan animate-pulse" />
          <span className="font-extrabold text-lg text-gradient-cyan-indigo tracking-wider">
            ATS.OPTIMA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to={isAuthenticated ? "/" : "/auth"} 
            className="px-5 py-2 rounded-xl text-sm font-semibold tracking-wide text-white bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            {isAuthenticated ? 'Enter Console' : 'Sign In'}
          </Link>
          {!isAuthenticated && (
            <Link 
              to="/auth" 
              className="px-5 py-2 rounded-xl text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300"
            >
              Get Started
            </Link>
          )}
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-indigo/10 border border-cyber-indigo/20 text-cyber-cyan text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce">
          <Sparkles size={12} /> Powered by Advanced RAG & Cosine Embeddings
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-tight">
          Supercharge Your Resume For <span className="text-gradient-cyan-indigo">Futuristic ATS</span> Screening
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-light">
          Don't get blocked by arbitrary algorithms. Utilize mathematical cosine-similarity embedding metrics, skill-gap analysis, and RAG contextual prompts to land your dream technical interview.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 justify-center">
          <Link 
            to={isAuthenticated ? "/upload" : "/auth"}
            className="px-8 py-4 rounded-xl text-base font-semibold tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo shadow-glow-cyan hover:scale-105 transition duration-300 flex items-center justify-center gap-2"
          >
            Launch Free Scan <CornerDownRight size={18} />
          </Link>
          <a 
            href="#rag-details"
            className="px-8 py-4 rounded-xl text-base font-semibold tracking-wide text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            How it Works
          </a>
        </div>

        {/* Dynamic statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mb-24">
          {[
            { value: '42%', label: 'Average ATS Score Gain', icon: TrendingUp },
            { value: '1.2s', label: 'Real-time Vector Search', icon: Cpu },
            { value: '98%', label: 'Accuracy Index', icon: FileCheck },
            { value: '150K+', label: 'Interviews Landed', icon: BrainCircuit }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col items-center">
              <stat.icon className="h-6 w-6 text-cyber-cyan mb-3" />
              <h3 className="text-3xl font-extrabold text-white mb-1">{stat.value}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="w-full max-w-6xl mb-32 text-left">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Engineered For SaaS Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Cosine Embeddings Model',
                desc: 'Computes deep semantic alignments between your resume and job requirements rather than relying purely on legacy keywords matching.',
                icon: Activity,
                color: 'border-t-cyber-cyan'
              },
              {
                title: 'Contextual RAG Prompts',
                desc: 'Retrieves relevant sections to compile metric-heavy improvements using standard enterprise-grade Generative LLMs.',
                icon: Cpu,
                color: 'border-t-cyber-indigo'
              },
              {
                title: 'Recruiter Match Board',
                desc: 'Allows technical hiring panels to parse multiple candidate files, stack scoring structures, and generate comprehensive rank leaderboards.',
                icon: Search,
                color: 'border-t-cyber-violet'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`glass-card p-8 rounded-2xl border-t-2 ${feature.color} transition-all duration-300`}>
                <feature.icon className="h-8 w-8 text-cyber-cyan mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RAG pipeline steps panel */}
        <div id="rag-details" className="w-full max-w-5xl text-left bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-cyber-cyan" /> The RAG Architecture Walkthrough
          </h2>
          
          <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            {[
              { title: 'Text Chunking', desc: 'Breaks down your uploaded PDF or DOCX file into overlapping paragraph matrices to preserve contextual relevance.' },
              { title: 'Embedding Vectors', desc: 'Generates a 768-dimensional token representation of both resume text and target Job Description details.' },
              { title: 'Semantic Vector Retrieval', desc: 'Queries Pinecone or dynamic in-memory database to index matching structures and filter missing concepts.' },
              { title: 'LLM Prompt Completion', desc: 'Assembles retrieved vectors inside customized rules templates and feeds the context payload to Gemini AI.' }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6 relative">
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 font-extrabold text-cyber-cyan text-sm shadow-glow-cyan z-10">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 md:px-12 text-center text-xs text-slate-500 bg-background/50 backdrop-blur-sm">
        <p className="mb-2">© 2026 ATS Optima Systems. Production-grade MERN Vector Pipeline.</p>
        <p className="font-mono text-slate-600">Secure AES / JWT Protected Routes • Explainable Talent AI Model</p>
      </footer>
    </div>
  );
};

export default LandingPage;
