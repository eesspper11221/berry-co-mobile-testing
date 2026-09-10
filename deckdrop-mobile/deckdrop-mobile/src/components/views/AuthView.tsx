import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserProfile } from '../../types';
import { BerryCoLogo } from '../common/BerryCoLogo';

export const AuthView: React.FC = () => {
  const { currentScreen, setCurrentUser, navigateTo, showToast } = useStore();
  const [tab, setTab] = useState<'login' | 'register'>(currentScreen === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    setTab(currentScreen === 'register' ? 'register' : 'login');
  }, [currentScreen]);

  const switchTab = (nextTab: 'login' | 'register') => {
    setTab(nextTab);
    setErrorMsg('');
    navigateTo(nextTab === 'login' ? 'login' : 'register');
  };

  const createLocalUser = (name: string): UserProfile => ({
    id: `usr-${Date.now()}`,
    full_name: name,
    email,
    phone: '+63 917 000 0000',
    role: 'customer',
    status: 'active',
    created_at: new Date().toISOString(),
    reward_points: tab === 'register' ? 200 : 100,
  });

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    const user = createLocalUser(email.split('@')[0]);
    setCurrentUser(user);
    showToast(`Signed in as ${user.full_name}.`, 'success');
    navigateTo('home');
  };

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setErrorMsg('Please accept the terms to continue.');
      return;
    }
    const user = createLocalUser(fullName.trim());
    setCurrentUser(user);
    showToast(`Welcome to Berry Co., ${user.full_name}.`, 'success');
    navigateTo('home');
  };

  const inputClass = 'w-full rounded-xl border border-[#35322E]/20 bg-[#F3E4C8]/75 px-3.5 py-3 text-sm font-semibold text-[#35322E] placeholder-[#35322E]/45 outline-none transition focus:border-[#E23B2E] focus:ring-2 focus:ring-[#E23B2E]/10';

  return (
    <main className="min-h-[calc(100dvh-56px)] bg-[#EAD0AA] px-5 py-12 sm:py-20 flex items-start justify-center">
      <section className="w-full max-w-[390px] rounded-[2rem] border border-[#35322E]/10 bg-[#FAF5EB] px-6 py-7 shadow-[0_18px_45px_rgba(53,50,46,0.14)] sm:px-8 sm:py-8">
        <div className="flex flex-col items-center text-center">
          <BerryCoLogo size={48} />
          <p className="mt-2 text-2xl font-black tracking-tight text-[#E23B2E]">Berry Co.</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#35322E]/55">Collect. Trade. Play.</p>
          <h1 className="mt-6 text-xl font-black text-[#35322E]">{tab === 'login' ? 'Welcome Back' : 'Create an Account'}</h1>
          <p className="mt-1 text-xs font-medium text-[#35322E]/60">
            {tab === 'login' ? 'Sign in to continue shopping rare TCGs and collectibles.' : 'Sign up to start buying rare TCGs and collectibles.'}
          </p>
        </div>

        <div className="mt-6 flex border-b border-[#35322E]/15 text-sm font-black">
          <button type="button" onClick={() => switchTab('login')} className={`flex-1 border-b-2 pb-3 transition ${tab === 'login' ? 'border-[#E23B2E] text-[#E23B2E]' : 'border-transparent text-[#35322E]/50'}`}>
            Log In
          </button>
          <button type="button" onClick={() => switchTab('register')} className={`flex-1 border-b-2 pb-3 transition ${tab === 'register' ? 'border-[#E23B2E] text-[#E23B2E]' : 'border-transparent text-[#35322E]/50'}`}>
            Sign Up
          </button>
        </div>

        {errorMsg && <div className="mt-4 rounded-xl border border-[#E23B2E]/25 bg-[#E23B2E]/10 px-3 py-2.5 text-center text-xs font-bold text-[#B82A20]">{errorMsg}</div>}

        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="mt-5 space-y-4">
            <label className="block text-xs font-black text-[#35322E]">Full Name<input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Juan Dela Cruz" className={`${inputClass} mt-1.5`} /></label>
            <label className="block text-xs font-black text-[#35322E]">Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="collector@berryco.ph" className={`${inputClass} mt-1.5`} /></label>
            <PasswordField label="Password" value={password} visible={showPassword} onChange={setPassword} onToggle={() => setShowPassword((visible) => !visible)} inputClass={inputClass} />
            <PasswordField label="Confirm Password" value={confirmPassword} visible={showConfirmPassword} onChange={setConfirmPassword} onToggle={() => setShowConfirmPassword((visible) => !visible)} inputClass={inputClass} />
            <label className="flex items-start gap-2 text-[11px] font-semibold leading-relaxed text-[#35322E]/70"><input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} className="mt-0.5 accent-[#E23B2E]" />I agree to Berry Co.'s terms and conditions.</label>
            <button type="submit" className="w-full rounded-full bg-[#E23B2E] py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#B82A20] active:scale-[.98]">Sign Up</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <label className="block text-xs font-black text-[#35322E]">Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="collector@berryco.ph" className={`${inputClass} mt-1.5`} /></label>
            <PasswordField label="Password" value={password} visible={showPassword} onChange={setPassword} onToggle={() => setShowPassword((visible) => !visible)} inputClass={inputClass} />
            <div className="flex justify-end"><button type="button" onClick={() => showToast('Password reset will be connected with Supabase later.', 'info')} className="text-[11px] font-bold text-[#E23B2E] hover:underline">Forgot password?</button></div>
            <button type="submit" className="w-full rounded-full bg-[#E23B2E] py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#B82A20] active:scale-[.98]">Log In</button>
          </form>
        )}

        <p className="mt-6 text-center text-xs font-semibold text-[#35322E]/65">{tab === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}<button type="button" onClick={() => switchTab(tab === 'login' ? 'register' : 'login')} className="font-black text-[#E23B2E] hover:underline">{tab === 'login' ? 'Sign Up' : 'Log In'}</button></p>
      </section>
    </main>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  inputClass: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, visible, onChange, onToggle, inputClass }) => (
  <label className="block text-xs font-black text-[#35322E]">{label}<span className="relative mt-1.5 block"><input type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className={`${inputClass} pr-11`} /><button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#35322E]/50" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
);
