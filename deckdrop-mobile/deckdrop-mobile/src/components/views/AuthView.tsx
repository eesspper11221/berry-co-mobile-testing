import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserCheck, Sparkles, Lock, Mail, User } from 'lucide-react';
import { UserProfile } from '../../types';
import { BerryCoLogo } from '../common/BerryCoLogo';

export const AuthView: React.FC = () => {
  const { setCurrentUser, navigateTo, showToast } = useStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: email.split('@')[0],
      email: email,
      phone: '+63 917 000 0000',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
      reward_points: 100,
    };

    setCurrentUser(newUser);
    showToast(`Signed in as ${newUser.full_name}!`, 'success');
    navigateTo('home');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      full_name: fullName || 'New Collector',
      email: email,
      phone: '+63 917 000 0000',
      role: 'customer',
      status: 'active',
      created_at: new Date().toISOString(),
      reward_points: 200,
    };

    setCurrentUser(newUser);
    showToast(`Welcome to Berry Co., ${newUser.full_name}! 🎉`, 'success');
    navigateTo('home');
  };

  const loginDemoAccount = (account: 'juan' | 'maria') => {
    if (account === 'juan') {
      setCurrentUser({
        id: 'usr-customer-1',
        full_name: 'Juan Dela Cruz',
        email: 'collector@berryco.ph',
        phone: '+63 917 555 1234',
        role: 'customer',
        status: 'active',
        created_at: '2025-01-15T08:00:00Z',
        reward_points: 480,
      });
      showToast('Logged in as Juan Dela Cruz (TCG Collector)', 'success');
      navigateTo('home');
    } else {
      setCurrentUser({
        id: 'usr-customer-2',
        full_name: 'Maria Santos',
        email: 'maria.santos@berryco.ph',
        phone: '+63 918 777 8899',
        role: 'customer',
        status: 'active',
        created_at: '2024-11-01T08:00:00Z',
        reward_points: 620,
      });
      showToast('Logged in as Maria Santos (Figurine Collector)', 'success');
      navigateTo('home');
    }
  };

  return (
    <div className="space-y-4 px-4 pt-3 pb-8">
      {/* Brand Header */}
      <div className="text-center space-y-1.5 pt-2 flex flex-col items-center">
        <BerryCoLogo size={52} />
        <span className="text-2xl font-black text-[#E23B2E] tracking-tight block">
          Berry Co.
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#35322E]/60">
          Collect &bull; Trade &bull; Play
        </p>
      </div>

      {/* 🧪 Quick Testing One-Tap Logins */}
      <div className="bg-[#FAF5EB] rounded-3xl p-4 border border-[#35322E]/10 shadow-xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#35322E]">
          <Sparkles size={14} className="text-[#E23B2E]" />
          <span>Quick Demo Testing Profiles</span>
        </div>
        <p className="text-[11px] font-medium text-[#35322E]/70">
          One-tap test login for instant prototype evaluation:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => loginDemoAccount('juan')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F3E4C8] hover:bg-[#EAD0AA] border border-[#35322E]/10 transition active:scale-95 cursor-pointer text-center"
          >
            <UserCheck size={18} className="text-[#E23B2E] mb-1" />
            <span className="text-xs font-black text-[#35322E]">Juan Dela Cruz</span>
            <span className="text-[9px] font-bold text-[#35322E]/60 uppercase">TCG Collector</span>
          </button>

          <button
            type="button"
            onClick={() => loginDemoAccount('maria')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F3E4C8] hover:bg-[#EAD0AA] border border-[#35322E]/10 transition active:scale-95 cursor-pointer text-center"
          >
            <UserCheck size={18} className="text-[#E23B2E] mb-1" />
            <span className="text-xs font-black text-[#35322E]">Maria Santos</span>
            <span className="text-[9px] font-bold text-[#35322E]/60 uppercase">Figure Collector</span>
          </button>
        </div>
      </div>

      {/* Main Auth Form Container */}
      <div className="bg-[#FAF5EB] rounded-3xl p-5 border border-[#35322E]/10 shadow-xs space-y-4">
        {/* Tab Switcher */}
        <div className="flex bg-[#F3E4C8] rounded-full p-1 text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full transition ${
              tab === 'login' ? 'bg-[#E23B2E] text-white shadow-xs' : 'text-[#35322E]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full transition ${
              tab === 'register' ? 'bg-[#E23B2E] text-white shadow-xs' : 'text-[#35322E]'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="bg-[#E23B2E]/10 border border-[#E23B2E] text-[#E23B2E] text-xs font-bold rounded-xl p-3 text-center">
            {errorMsg}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3 text-xs font-semibold text-[#35322E]">
            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@berryco.ph"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white font-black text-xs transition active:scale-95 shadow-xs mt-2"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-xs font-semibold text-[#35322E]">
            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collector@berryco.ph"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#35322E]/80 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F3E4C8] border border-[#35322E]/20 rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium text-[#35322E] focus:outline-none focus:border-[#E23B2E]"
                />
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white font-black text-xs transition active:scale-95 shadow-xs mt-2"
            >
              Register Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
