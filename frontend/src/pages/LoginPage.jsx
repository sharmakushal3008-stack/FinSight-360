import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, demoLogin } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('rm@finsight.demo');
  const [password, setPassword] = useState('Demo@123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior RM');
  const [branch, setBranch] = useState('North Zone Flagship Branch');
  const [phone, setPhone] = useState('+91 98765 43210');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please provide your full name');
          setLoading(false);
          return;
        }
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          branch,
          phone,
        });
      } else {
        await login(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
      setError('Demo authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (signUpMode) => {
    setIsSignUp(signUpMode);
    setError('');
    if (signUpMode) {
      setEmail('');
      setPassword('');
    } else {
      setEmail('rm@finsight.demo');
      setPassword('Demo@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Abstract Logo */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#0F2744] to-[#1E40AF] text-white flex items-center justify-center font-display font-bold text-2xl shadow-lg mb-3">
          F3
        </div>

        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">
          FinSight 360
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          AI Relationship Intelligence & Opportunity Engine
        </p>
        <p className="text-xs text-blue-700 font-semibold mt-0.5">
          "Know Your Customers. Know What Matters Next."
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200 space-y-5">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`w-1/2 py-2 text-xs font-semibold rounded-lg transition-all ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create RM Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Login Banner (Shown on Sign In tab) */}
          {!isSignUp && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Quick Portfolio Demo Access
                </span>
                <span className="text-[10px] bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                  1-Click
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Experience the full Relationship Manager Command Center with pre-loaded fictional customer portfolios.
              </p>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In as Senior RM (Demo@123)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {!isSignUp && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kushagra Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg mt-1 focus:outline-none"
                    >
                      <option value="Relationship Manager">Relationship Manager</option>
                      <option value="Senior RM">Senior RM</option>
                      <option value="Branch Head">Branch Head</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Phone</label>
                    <div className="relative mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Branch Name</label>
                  <div className="relative mt-1">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">Official Email</label>
              <div className="relative mt-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rm@finsight.demo"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                <>
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Register & Open RM Workspace</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Secure Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center">
            {isSignUp ? (
              <p className="text-xs text-slate-500">
                Already have an RM account?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Need a new RM workspace?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Educational & Portfolio Demonstration • All customer data is simulated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
