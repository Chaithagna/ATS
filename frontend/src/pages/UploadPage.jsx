import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  FileUp, 
  FileText, 
  Sparkles, 
  Cpu, 
  AlertCircle, 
  Activity, 
  Gauge, 
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
  Award,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

const UploadPage = () => {
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load report from URL parameter if provided
  useEffect(() => {
    const reportId = searchParams.get('reportId');
    if (reportId) {
      const fetchReport = async () => {
        setIsProcessing(true);
        setStatusMessage('Loading compiled audit results...');
        try {
          const res = await api.get(`/analysis/report/${reportId}`);
          if (res.success) {
            setReport(res.report);
          }
        } catch (error) {
          console.error(error.message);
        } finally {
          setIsProcessing(false);
        }
      };
      fetchReport();
    }
  }, [searchParams]);

  // Dropzone drag-drop config
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // Master upload & scan process runner
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) return;

    setIsProcessing(true);
    setCurrentProgress(10);
    setStatusMessage('Uploading and indexing document binary...');

    try {
      // 1. Upload & Parse text
      const formData = new FormData();
      formData.append('resume', file);
      
      const uploadRes = await api.upload('/resumes/upload', formData);
      if (!uploadRes.success) throw new Error('File parse failed');

      setCurrentProgress(45);
      setStatusMessage('Extracting heuristic layout metadata...');

      // 2. Process metrics & trigger RAG context suggestions
      const resumeId = uploadRes.resume.id;
      
      setCurrentProgress(70);
      setStatusMessage('Triggering embedding alignments and LangChain prompt retrieval...');

      const processRes = await api.post('/analysis/process', {
        resumeId,
        jobDescription,
        jobTitle: jobTitle || 'Target Position'
      });

      if (processRes.success) {
        setCurrentProgress(100);
        setStatusMessage('Audit compilation successful!');
        setTimeout(() => {
          setReport(processRes.report);
          setIsProcessing(false);
        }, 800);
      } else {
        throw new Error('Analysis alignment failed');
      }

    } catch (error) {
      console.error(error);
      alert(error.message || 'System fault encountered during pipeline scan.');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription('');
    setJobTitle('');
    setReport(null);
    setActiveTab('overview');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {!report && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Cpu className="h-8 w-8 text-cyber-cyan animate-pulse" /> Advanced ATS RAG Scan
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
              Perform deep semantic matching, keyword extraction, and contextual LLM audits. Supports PDF and DOCX formats.
            </p>
          </div>

          {isProcessing ? (
            /* Scanning line loading block */
            <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6 text-center relative overflow-hidden h-72 flex flex-col items-center justify-center">
              <div className="scanning-line" />
              <Activity className="h-12 w-12 text-cyber-cyan animate-spin-slow mb-2" />
              <h3 className="text-lg font-bold text-white tracking-wide">{statusMessage}</h3>
              <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyber-cyan to-cyber-indigo h-1.5 transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">{currentProgress}% Pipeline Status</span>
            </div>
          ) : (
            <form onSubmit={handleAnalyze} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Drag drop zone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Resume Document</label>
                <div 
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                    isDragActive 
                      ? 'border-cyber-cyan bg-cyber-cyan/5' 
                      : file 
                        ? 'border-emerald-500/40 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="h-10 w-10 text-emerald-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">{file.name}</h4>
                      <p className="text-xs text-slate-400">File size: {Math.round(file.size / 1024)} KB • Click to swap file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileUp className="h-10 w-10 text-slate-500 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-300">Drag & Drop Resume here</h4>
                      <p className="text-xs text-slate-400">Supports PDF & DOCX standard layouts (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job description input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Target Job Description</label>
                <textarea
                  rows={8}
                  placeholder="Paste the full job specification details here to evaluate similarity score matrices..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!file || !jobDescription}
                className="w-full py-4 rounded-xl font-extrabold text-sm tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Execute Neural Matching Audit
              </button>
            </form>
          )}
        </div>
      )}

      {/* Audit Report View Dashboard (AnalysisPage) */}
      {report && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
            <div>
              <span className="text-xs text-cyber-cyan font-semibold uppercase tracking-wider">Report Assessment</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{report.jobTitle}</h1>
              <p className="text-xs text-slate-400 mt-1 font-light">Evaluated using cosine matching models against parsed structural sections.</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white flex items-center gap-2"
            >
              <RefreshCw size={14} /> Reset and Audit Another
            </button>
          </div>

          {/* Core Score Dials Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'Overall Score', val: report.scores.overall, color: 'text-cyber-cyan' },
              { label: 'Keywords Match', val: report.scores.keywordMatch, color: 'text-cyber-indigo' },
              { label: 'Semantic similarity', val: report.scores.semanticSimilarity, color: 'text-cyber-violet' },
              { label: 'Project Impact', val: report.scores.projectQuality, color: 'text-fuchsia-400' },
              { label: 'Experience Match', val: report.scores.experienceMatch, color: 'text-emerald-400' }
            ].map((card, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center relative overflow-hidden">
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-2">{card.label}</span>
                <div className={`text-3xl font-extrabold ${card.color} font-mono mb-1`}>{card.val}%</div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                  <div className={`h-1 rounded-full ${
                    card.val >= 75 ? 'bg-emerald-400' : card.val >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                  }`} style={{ width: `${card.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-white/5 space-x-6 text-sm">
            {[
              { id: 'overview', name: 'Semantic Gaps', icon: Activity },
              { id: 'keywords', name: 'Keyword Heatmap', icon: Gauge },
              { id: 'suggestions', name: 'RAG Suggestions', icon: Sparkles },
              { id: 'formatting', name: 'Formatting Checker', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 font-bold relative transition-colors ${
                  activeTab === tab.id ? 'text-cyber-cyan border-b-2 border-cyber-cyan' : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} /> {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="mt-6">
            
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skill gap Analysis */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Award className="text-cyber-cyan" /> Skill Gap Matrix</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Comparison between your resume assets and job requirements.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Matched skills ({report.skillGap.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.skillGap.matchedSkills.length > 0 ? (
                          report.skillGap.matchedSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-light">None parsed. Inject standard keywords.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-cyber-rose uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <XCircle size={14} /> Missing Skills ({report.skillGap.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.skillGap.missingSkills.length > 0 ? (
                          report.skillGap.missingSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyber-rose/10 text-cyber-rose border border-cyber-rose/20 text-xs font-medium animate-pulse">
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-light">None missing! Excellent alignment.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-cyber-cyan uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <HelpCircle size={14} /> Recommended learning certifications
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-400 font-light list-disc pl-4">
                        {report.skillGap.suggestedCertifications.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Job Alignment Prediction / AI Suggestions */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu className="text-cyber-cyan" /> Job Role Alignment Model</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Predicts candidate onboarding readiness and formatting quality.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Career Fit Prediction</span>
                    <div className="text-5xl font-extrabold text-gradient-cyan-indigo font-mono">
                      {report.careerRecommendations?.alignmentPrediction || 65}%
                    </div>
                    <p className="text-xs text-slate-400 font-light">Predicted interview success rate based on semantic alignment weight.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Career Roadmap Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.careerRecommendations?.roles.map((role, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyber-indigo/20 text-cyber-indigo border border-cyber-indigo/30 text-xs font-semibold">
                          {role}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Upskilling Paths</h4>
                    <ul className="space-y-2 text-xs text-slate-400 pl-4 list-decimal font-light">
                      {report.careerRecommendations?.upskillRoadmap.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Keywords density tab */}
            {activeTab === 'keywords' && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Gauge className="text-cyber-cyan" /> Keyword Match Heatmap</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-light">Frequency scans mapping parsed token occurrences versus target density thresholds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.keywordAnalysis.density.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-white capitalize">{item.keyword}</h4>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5">Recommended density matches: {item.recommendedCount}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                          item.count > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyber-rose/10 text-cyber-rose border border-cyber-rose/20'
                        }`}>
                          Matched: {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAG Suggestions tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                {/* Bullet Optimization */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Sparkles className="text-cyber-cyan" /> High-Impact Bullet optimizations</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Action-oriented metrics suggestions using Google X-Y-Z rules configurations.</p>
                  </div>

                  <div className="space-y-4">
                    {report.aiSuggestions.strongerBulletPoints.map((bp, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <div className="text-xs text-cyber-rose line-through font-light leading-relaxed">Original: "{bp.original}"</div>
                        <div className="text-xs text-emerald-400 font-bold leading-relaxed">Improved: "{bp.improved}"</div>
                        <div className="text-[10px] text-slate-400 italic">Audit Rationale: {bp.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects Optimization */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Cpu className="text-cyber-cyan" /> Technical Projects Enhancements</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Inject modern framework credentials and scalable statistics.</p>
                  </div>

                  <div className="space-y-4">
                    {report.aiSuggestions.projectImprovements.map((proj, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{proj.title}</h4>
                        <div className="text-xs text-cyber-rose line-through font-light leading-relaxed">Original: "{proj.original}"</div>
                        <div className="text-xs text-emerald-400 font-bold leading-relaxed">Improved: "{proj.improved}"</div>
                        <div className="text-[10px] text-slate-400 italic">Audit Rationale: {proj.rationale}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Formatting Analysis tab */}
            {activeTab === 'formatting' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 lg:col-span-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">Formatting Checklist Audit</h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">Structure issues that could throw off parsing layouts.</p>
                  </div>

                  <div className="space-y-3">
                    {report.formattingAnalysis.formattingTips.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-300">
                        <CheckCircle size={16} className="shrink-0 text-emerald-400" />
                        <p className="leading-relaxed font-light">{tip}</p>
                      </div>
                    ))}
                    {report.formattingAnalysis.warnings.map((warn, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-cyber-rose/5 border border-cyber-rose/10 text-xs text-cyber-rose">
                        <AlertCircle size={16} className="shrink-0 text-cyber-rose" />
                        <p className="leading-relaxed font-light">{warn}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
                  <BookOpen className="h-10 w-10 text-cyber-cyan mb-3 animate-pulse" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Readability Index</span>
                  <div className="text-5xl font-extrabold text-gradient-cyan-indigo font-mono my-2">
                    {report.formattingAnalysis.readabilityScore}%
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Flesch-Kincaid index approximation. High scores mean ideal word density.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default UploadPage;
