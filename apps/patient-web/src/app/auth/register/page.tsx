'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';
import type { ConfirmationResult } from '@/lib/firebase';

declare global {
  interface Window { recaptchaVerifier?: InstanceType<typeof RecaptchaVerifier>; }
}

const formatE164 = (raw: string) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('91') && d.length === 12) d = d.slice(2);
  d = d.replace(/^0+/, '').slice(-10);
  return `+91${d}`;
};

export default function RegisterPage() {
  const router = useRouter();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      window.recaptchaVerifier = undefined;
    }
    if (recaptchaContainerRef.current) recaptchaContainerRef.current.innerHTML = '';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const digits = phone.replace(/\D/g, '');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (digits.length !== 10) { setError('Enter a valid 10-digit mobile number.'); return; }

    setLoading(true);
    const formattedPhone = formatE164(phone);

    try {
      clearRecaptcha();

      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => clearRecaptcha(),
      });

      await verifier.render();
      window.recaptchaVerifier = verifier;

      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmation(result);
      setStep('OTP');
      setTimer(60);
    } catch (err: any) {
      clearRecaptcha();
      console.error('[Firebase Phone Auth]', err.code, err.message);

      if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts on this number. Please wait 24h or try a different number.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorised in Firebase. Please contact support.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid mobile number. Please check and try again.');
      } else {
        setError('Failed to send OTP. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setError('');
    setLoading(true);

    try {
      await confirmation.confirm(otp);
      const formattedPhone = formatE164(phone);

      // Save local session (backend sync optional)
      localStorage.setItem('user', JSON.stringify({ name, phone: formattedPhone, role: 'PATIENT' }));
      localStorage.setItem('token', `session_${Date.now()}`);

      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Firebase OTP Verify]', err.code, err.message);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Wrong OTP. Please check the SMS and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new code.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    clearRecaptcha();
    setOtp('');
    setError('');
    setStep('FORM');
    setConfirmation(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      {/* Invisible reCAPTCHA anchor */}
      <div ref={recaptchaContainerRef} />

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl">
            📱
          </div>
          <h1 className="text-2xl font-black text-white">
            {step === 'FORM' ? 'Create Account' : 'Enter OTP'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'FORM'
              ? 'We'll send a 6-digit code to your mobile'
              : `OTP sent to +91 ${phone}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Step 1 — Registration Form */}
        {step === 'FORM' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sameer Khan"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-teal-400 font-mono font-bold select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  placeholder="9912092468"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 font-mono tracking-widest focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-sm rounded-xl hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* Step 2 — OTP Form */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                placeholder="------"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full p-4 bg-slate-950 border border-teal-500/40 rounded-xl text-center font-mono text-3xl text-teal-400 tracking-[0.5em] focus:outline-none focus:border-teal-400 placeholder-slate-700 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-teal-400 text-slate-950 font-black text-sm rounded-xl hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : '✅ Verify & Register'}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-xs text-slate-500">Resend in <span className="text-teal-400 font-bold">{timer}s</span></p>
              ) : (
                <button type="button" onClick={handleBack} className="text-xs text-teal-400 hover:underline">
                  ↺ Resend OTP
                </button>
              )}
            </div>
            <button type="button" onClick={handleBack} className="w-full text-center text-xs text-slate-500 hover:text-slate-300">
              ← Change Number
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-400 font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
