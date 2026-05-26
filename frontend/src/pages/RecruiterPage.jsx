import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Users, 
  FileUp, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Cpu,
  Trophy,
  Mail,
  Phone,
  Bookmark,
  FileCheck
} from 'lucide-react';
import api from '../services/api';

const RecruiterPage = () => {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const [leaderboard, setLeaderboard] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleBatchAnalyze = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !jobDescription) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Bootstrapping file indexing sequence...');

    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      formData.append('jobTitle', jobTitle || 'Target Requirement');
      
      files.forEach((file) => {
        formData.append('resumes', file);
      });

      setProgress(40);
      setStatusMessage('Parsing document layouts and executing vector models...');

      const res = await api.upload('/recruiter/analyze-batch', formData);
      
      setProgress(85);
      setStatusMessage('Synthesizing compatibility comparisons...');

      if (res.success) {
        setProgress(100);
        setTimeout(() => {
          setLeaderboard(res.leaderboard);
          setIsProcessing(false);
        }, 800);
      } else {
        throw new Error('Batch operation failed');
      }

    } catch (error) {
      console.error(error);
      alert(error.message || 'Fatal exception encountered during batch pipeline scan.');
      setIsProcessing(false);
    }
  };

  const handleToggleShortlist = (resumeId) => {
    setShortlistedIds(prev => {
      const next = new Set(prev);
      if (next.has(resumeId)) {
        next.delete(resumeId);
      } else {
        next.add(resumeId);
      }
      return next;
    });
  };

  const handleClear = () => {
    setFiles([]);
    setJobDescription('');
    setJobTitle('');
    setLeaderboard([]);
    setShortlistedIds(new Set());
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-cyber-cyan" /> Recruiter Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
            Upload multiple resumes at once to rank candidates based on deep embedding cosine similarity calculations.
          </p>
        </div>
        {leaderboard.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition"
          >
            Clear and Run New Scan
          </button>
        )}
      </div>

      {leaderboard.length === 0 && (
        <div className="max-w-4xl mx-auto space-y-6">
          {isProcessing ? (
            /* Scanning line loader */
            <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 text-center relative overflow-hidden h-72 flex flex-col items-center justify-center">
              <div className="scanning-line" />
              <Activity className="h-12 w-12 text-cyber-cyan animate-spin-slow mb-2" />
              <h3 className="text-lg font-bold text-white tracking-wide">{statusMessage}</h3>
              <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyber-cyan to-cyber-indigo h-1.5 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">{progress}% Complete</span>
            </div>
          ) : (
            <form onSubmit={handleBatchAnalyze} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Target Requisition Role</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Systems Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Multi-Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Select Resumes ({files.length} added)</label>
                <div 
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                    isDragActive 
                      ? 'border-cyber-cyan bg-cyber-cyan/5' 
                      : files.length > 0 
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileUp className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-300">Drag & Drop Resumes here</h4>
                  <p className="text-xs text-slate-400">Select multiple PDF / DOCX documents to process batch scans (Max 15 resumes)</p>
                </div>

                {/* Queue display */}
                {files.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 max-h-40 overflow-y-auto">
                    <h5 className="text-[10px] text-slate-400 uppercase font-semibold">Indexed queue</h5>
                    <div className="space-y-1.5">
                      {files.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 truncate max-w-xs">{f.name}</span>
                          <span className="text-slate-500 font-mono">{Math.round(f.size / 1024)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Job Requirements Description</label>
                <textarea
                  rows={6}
                  placeholder="Paste the target job description to dynamically score candidates..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={files.length === 0 || !jobDescription}
                className="w-full py-4 rounded-xl font-extrabold text-sm tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Users size={16} /> Execute Competitive Candidate Rank Scan
              </button>
            </form>
          )}
        </div>
      )}

      {/* Ranked Candidate Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="text-amber-400 h-5 w-5" /> Competitive Candidate Leaderboard
            </h3>
            <p className="text-xs text-slate-400 font-light">Calculated based on standard ATS 5-tier parameters. Rank order sorted descending.</p>
          </div>

          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider pb-3 bg-white/[0.02]">
                    <th className="py-4 pl-4">Rank / Name</th>
                    <th className="py-4">Contact Parameters</th>
                    <th className="py-4">Overall Score</th>
                    <th className="py-4">Keywords / Cosine match</th>
                    <th className="py-4 text-center">Shortlist Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((cand, idx) => (
                    <tr 
                      key={cand.resumeId} 
                      className={`transition-colors ${
                        shortlistedIds.has(cand.resumeId) ? 'bg-cyber-cyan/5 hover:bg-cyber-cyan/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold font-mono ${
                            idx === 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-white">{cand.candidateName}</h4>
                            <p className="text-[10px] text-slate-400 font-light truncate max-w-xs">{cand.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-300">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Mail size={12} /> {cand.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Phone size={12} /> {cand.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-md ${
                          cand.scores.overall >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {cand.scores.overall}%
                        </span>
                      </td>
                      <td className="py-4 font-mono text-slate-400">
                        {cand.scores.keywordMatch}% / {cand.scores.semanticSimilarity}%
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleToggleShortlist(cand.resumeId)}
                          className={`p-2 rounded-lg border transition ${
                            shortlistedIds.has(cand.resumeId)
                              ? 'bg-cyber-cyan border-cyber-cyan text-white shadow-glow-cyan'
                              : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                          }`}
                          title="Toggle Shortlist Flag"
                        >
                          <Bookmark size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecruiterPage;
