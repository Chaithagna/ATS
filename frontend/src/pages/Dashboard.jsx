import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileUp, 
  Sparkles, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Database,
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalScans: 0,
    maxScore: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/analysis/history');
        if (res.success) {
          setReports(res.reports);
          
          if (res.reports.length > 0) {
            const total = res.reports.reduce((acc, curr) => acc + curr.scores.overall, 0);
            const max = Math.max(...res.reports.map(r => r.scores.overall));
            setStats({
              avgScore: Math.round(total / res.reports.length),
              totalScans: res.reports.length,
              maxScore: max
            });
          }
        }
      } catch (error) {
        console.error('[Dashboard Data Fetch Error]:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format Recharts data (reverse reports array to show chronologically)
  const chartData = [...reports].reverse().map(r => ({
    date: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: r.scores.overall,
    keyword: r.scores.keywordMatch,
    semantic: r.scores.semanticSimilarity
  }));

  // Standard static dashboard if empty
  const defaultChartData = [
    { date: 'Scan 1', score: 45, keyword: 40, semantic: 50 },
    { date: 'Scan 2', score: 62, keyword: 55, semantic: 65 },
    { date: 'Scan 3', score: 78, keyword: 70, semantic: 80 }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Developer Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-light tracking-wide">
            Analyze, rewrite, and compare MERN embedding scores. Mode: {user?.settings?.geminiKey ? 'Production (Live API)' : 'Sandbox/Local Heuristics'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/upload"
            className="px-5 py-3 rounded-xl text-xs font-bold tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 flex items-center gap-2"
          >
            <FileUp size={16} /> Analyze New Resume
          </Link>
        </div>
      </div>

      {/* Summary grid blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Average ATS Score', value: `${stats.avgScore}%`, desc: 'Overall compatibility benchmark', icon: TrendingUp, color: 'text-cyber-cyan' },
          { title: 'Peak Analysis Score', value: `${stats.maxScore}%`, desc: 'Highest target match indexed', icon: Sparkles, color: 'text-cyber-indigo' },
          { title: 'Resume Evaluations', value: stats.totalScans, desc: 'Total batch uploads processed', icon: Database, color: 'text-cyber-violet' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.title}</span>
              <h3 className="text-4xl font-extrabold text-white">{item.value}</h3>
              <p className="text-xs text-slate-400 font-light">{item.desc}</p>
            </div>
            <item.icon className={`h-12 w-12 ${item.color} opacity-20 shrink-0`} />
          </div>
        ))}
      </div>

      {/* Recharts trend graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Historical Compatibility Audits</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-light">Performance trends over successive document revisions.</p>
            </div>
          </div>

          <div className="h-72 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : defaultChartData}>
                <defs>
                  <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="semanticGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 100]} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#090915', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGlow)" name="ATS Score" />
                <Area type="monotone" dataKey="semantic" stroke="#6366f1" strokeWidth={1.5} fillOpacity={1} fill="url(#semanticGlow)" name="Semantic Sim" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature quick links grid */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyber-cyan animate-spin-slow" /> Advanced AI Copilot Tools
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
              Supercharge resume items, simulate interview questioning levels, and generate customized recruiter ranking spreadsheets.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { path: '/improve', label: 'AI Bullet Rewriter', desc: 'Optimize metric-heavy bullets', icon: Sparkles },
              { path: '/interview', label: 'Technical Mock Interview', desc: 'Custom STAR answers preparation', icon: MessageSquare },
              { path: '/recruiter', label: 'Recruiter Match Board', desc: 'Process multiple resumes', icon: Users },
            ].map((link, idx) => (
              <Link 
                key={idx}
                to={link.path}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-cyber-cyan" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{link.label}</h4>
                    <p className="text-[10px] text-slate-400 font-light">{link.desc}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Reports history table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">Recent Audit Logs</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-light">Complete historical ledger of analyzed target jobs.</p>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center text-xs text-slate-500">
            Fetching system records...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white/5 border border-dashed border-white/5">
            <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-slate-400">No Analysis Ledger Found</h4>
            <p className="text-[10px] text-slate-500 font-light mt-1 mb-4">You must upload and analyze your resume to populate tracking dashboards.</p>
            <Link 
              to="/upload" 
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10"
            >
              Launch First Analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider pb-3">
                  <th className="pb-3 pl-2">Job Title</th>
                  <th className="pb-3">Source Resume</th>
                  <th className="pb-3">Overall score</th>
                  <th className="pb-3">Keywords / Semantic</th>
                  <th className="pb-3">Processed Date</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.slice(0, 5).map((report) => (
                  <tr key={report._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2 font-bold text-white">{report.jobTitle}</td>
                    <td className="py-4 text-slate-300">{report.resume?.fileName || 'N/A'}</td>
                    <td className="py-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-md ${
                        report.scores.overall >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {report.scores.overall}%
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 font-mono">
                      {report.scores.keywordMatch}% / {report.scores.semanticSimilarity}%
                    </td>
                    <td className="py-4 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <Link
                        to={`/upload?reportId=${report._id}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-[10px] font-bold text-white transition inline-block"
                      >
                        Auditing breakdown
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
