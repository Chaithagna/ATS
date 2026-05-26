import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const { login, signup, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } else {
      if (formData.name.trim().length < 2) {
        setError('Please provide a valid display name.');
        setLoading(false);
        return;
      }
      const res = await signup(formData.name, formData.email, formData.password, formData.role);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
    setLoading(false);
  };

  // Google OAuth Stub Handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const mockGoogleData = {
      googleId: `g_${Math.random().toString(36).substring(2, 11)}`,
      email: formData.email || 'developer.sandbox@gmail.com',
      name: formData.name || 'Sandbox Developer',
      avatar: ''
    };

    const res = await googleLogin(mockGoogleData);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Google login mock authentication failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background px-4 transition-colors duration-700">
      {/* Dynamic Animated Mesh Backdrops */}
      <div className="cyber-bg" />
      <div className="cyber-bg-glow-3" />

      <div className="w-full max-w-md relative">
        {/* Floating glow elements */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyber-indigo/10 rounded-full blur-2xl animate-pulse-slow" />

        <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-glass-md backdrop-blur-2xl relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyber-cyan to-cyber-indigo text-white mb-4 shadow-glow-indigo">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isLogin ? 'Access Console' : 'Initialize Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-light tracking-wide">
              {isLogin ? 'Enter MERN Vector Engine credentials' : 'Set up developer profiling credentials'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl glass-input text-sm font-medium"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Target Persona</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm font-medium appearance-none"
                >
                  <option value="user">SaaS Candidate (Standard)</option>
                  <option value="recruiter">Recruiter / Employer Panel</option>
                </select>
              </div>
            )}

            {error && (
              <div className="text-xs text-cyber-rose bg-cyber-rose/10 border border-cyber-rose/20 p-3 rounded-xl leading-relaxed text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyber-cyan to-cyber-indigo hover:shadow-glow-cyan transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Operations...' : (isLogin ? 'Enter Sandbox Portal' : 'Register Account')}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-between text-slate-600 text-xs">
            <span className="h-[1px] bg-white/5 w-[42%]" />
            <span className="uppercase tracking-wider">or</span>
            <span className="h-[1px] bg-white/5 w-[42%]" />
          </div>

          {/* Google OAuth trigger */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold border border-white/10 text-slate-300 hover:bg-white/5 transition flex items-center justify-center gap-2 mb-6"
          >
            <KeyRound size={14} /> Bypass Credentials via Google OAuth (Mock)
          </button>

          {/* Toggle */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isLogin ? "New user? Create a profile layout" : "Already registered? Authenticate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
