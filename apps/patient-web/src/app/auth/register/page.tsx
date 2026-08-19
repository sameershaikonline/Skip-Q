'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, User, Phone } from 'lucide-react';

type Step = 'DETAILS' | 'OTP' | 'PASSWORD';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

export default function PatientRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('DETAILS');

  // Step 1 Form Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 OTP
  const [otp, setOtp] = useState('');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Step 3 Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Submit Registration Details with Strict Validations
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address with domain suffix (e.g. name@gmail.com).');
      return;
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter exactly a 10-digit mobile phone number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `Verification OTP sent to ${cleanEmail}`);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Registration request failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid or expired OTP code.');

      setSuccess('OTP verified successfully! Now set your account password.');
      setStep('PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Set Account Password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set password');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user || { name, email, phone }));
        localStorage.removeItem('skipq_location_prompted');
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to finalize registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 space-y-6">
      <div className="glass p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6 text-center">
        {/* Brand Shield Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {/* Header Titles */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 'DETAILS' && 'Patient Registration'}
            {step === 'OTP' && 'Verify Email OTP'}
            {step === 'PASSWORD' && 'Set Account Password'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'DETAILS' && 'Step 1 of 3: Enter your contact details'}
            {step === 'OTP' && 'Step 2 of 3: Enter the 6-digit code sent to your email'}
            {step === 'PASSWORD' && 'Step 3 of 3: Create a secure password for future logins'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-500 font-bold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-500 font-bold text-center">
            {success}
          </div>
        )}

        {previewOtp && step === 'OTP' && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-600 dark:text-blue-400 font-bold text-center">
            Development Verification OTP: <span className="font-mono text-sm">{previewOtp}</span>
          </div>
        )}

        {/* STEP 1: Personal Details */}
        {step === 'DETAILS' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email (e.g. name@gmail.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300">Mobile Phone Number *</label>
                <span className="text-[10px] text-slate-400 font-normal">Exactly 10 digits ({phone.length}/10)</span>
              </div>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Verification OTP...</span>
                </>
              ) : (
                'Send Verification OTP ➔'
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-blue-500 hover:underline font-bold">
                Already registered? Sign in with password
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-2xl font-mono text-center font-black tracking-widest outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                'Verify & Proceed to Set Password ➔'
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-slate-500 hover:text-slate-700 font-bold"
              >
                ← Back to edit contact details
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set Password */}
        {step === 'PASSWORD' && (
          <form onSubmit={handleSetPassword} className="space-y-4 text-xs font-bold text-left">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">New Password (Min 6 chars) *</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Finalizing Registration...</span>
                </>
              ) : (
                'Set Password & Complete Registration ➔'
              )}
            </button>
          </form>
        )}

        <p className="text-[11px] font-medium text-slate-500 pt-2">
          Skip-Q Official Healthcare Authentication
        </p>
      </div>
    </div>
  );
}
