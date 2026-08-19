'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  RefreshCw,
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Compass,
} from 'lucide-react';

type Step = 'DETAILS' | 'OTP' | 'PASSWORD' | 'LOCATION';

interface UserLocation {
  city: string;
  address: string;
  lat: number;
  lon: number;
  isServed: boolean;
  distanceKm?: number;
}

const MBD_LAT = 17.5986;
const MBD_LON = 80.0035;
const SERVICE_RADIUS_KM = 25;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const searchCache = new Map<string, any[]>();

export default function PatientRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('DETAILS');

  // Step 1 Form Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 OTP & Attempts
  const [otp, setOtp] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Step 3 Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 4 Location Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (step === 'OTP' && resendTimer > 0) {
      const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(id);
    }
  }, [step, resendTimer]);

  // Fast Location Autocomplete in Step 4
  useEffect(() => {
    if (step !== 'LOCATION') return;
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchCache.has(trimmed.toLowerCase())) {
      setSearchResults(searchCache.get(trimmed.toLowerCase()) || []);
      return;
    }

    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&lang=en`
        );
        const photonData = await photonRes.json();

        if (photonData?.features && photonData.features.length > 0) {
          const formatted = photonData.features.map((f: any) => {
            const props = f.properties || {};
            const coords = f.geometry?.coordinates || [0, 0];
            const city = props.city || props.town || props.village || props.name || props.district || 'Location';
            const state = props.state ? `, ${props.state}` : '';
            const address = `${props.name || city}${props.street ? `, ${props.street}` : ''}${state}`;
            return {
              display_name: address,
              city,
              lat: coords[1],
              lon: coords[0],
            };
          });

          searchCache.set(trimmed.toLowerCase(), formatted);
          setSearchResults(formatted);
          setSearching(false);
          return;
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        const formatted = (data || []).map((item: any) => ({
          display_name: item.display_name,
          city: item.address?.city || item.address?.town || item.address?.village || item.name || 'Location',
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));

        searchCache.set(trimmed.toLowerCase(), formatted);
        setSearchResults(formatted);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => clearTimeout(delay);
  }, [searchQuery, step]);

  // 1. Submit Registration Details with Active Email Notice
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
      setAttemptsRemaining(5);
      setResendTimer(30);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Registration request failed.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP with 5 Attempts Limit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (attemptsRemaining <= 0) {
      setError('Maximum 5 OTP attempts reached. Please click "Resend OTP" to receive a fresh code.');
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

      if (!res.ok) {
        const nextAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(nextAttempts);
        if (nextAttempts > 0) {
          throw new Error(`Invalid OTP code! You have ${nextAttempts} attempt${nextAttempts > 1 ? 's' : ''} remaining.`);
        } else {
          throw new Error('Maximum 5 OTP attempts exhausted. Please click "Resend OTP" to generate a fresh code.');
        }
      }

      setSuccess('OTP verified successfully! Now set your account password.');
      setStep('PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');

      if (data.otp) setPreviewOtp(data.otp);
      setSuccess(data.message || `Fresh OTP sent to ${email}`);
      setAttemptsRemaining(5);
      setResendTimer(30);
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Error resending code.');
    } finally {
      setResending(false);
    }
  };

  // 3. Set Account Password -> Seamlessly Move to Mandatory Location Selection Step
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
        window.dispatchEvent(new Event('skipq_auth_change'));
        // Move directly to Step 4: Mandatory Location Selection!
        setStep('LOCATION');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to finalize registration.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Auto-Detect GPS & IP Geolocation for Step 4
  const handleDetectCurrentLocation = async () => {
    setDetectingGps(true);
    setError('');

    const resolveLocationData = (lat: number, lon: number, cityName: string, fullAddress: string) => {
      const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
      const isMahabubabad =
        cityName.toLowerCase().includes('mahabubabad') ||
        cityName.toLowerCase().includes('mahbubabad') ||
        dist <= SERVICE_RADIUS_KM;

      const locObj: UserLocation = {
        city: isMahabubabad ? 'Mahabubabad' : cityName,
        address: fullAddress,
        lat,
        lon,
        isServed: isMahabubabad,
        distanceKm: dist,
      };

      setSelectedLocation(locObj);
      setDetectingGps(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.state_district ||
              'Current Location';
            resolveLocationData(lat, lon, city, data.display_name || `${city}, India`);
          } catch {
            resolveLocationData(lat, lon, 'Detected Location', `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        },
        async () => {
          try {
            const ipRes = await fetch('https://ipwho.is/');
            const ipData = await ipRes.json();
            if (ipData && ipData.success !== false) {
              const lat = ipData.latitude || MBD_LAT;
              const lon = ipData.longitude || MBD_LON;
              const city = ipData.city || 'Detected Location';
              resolveLocationData(lat, lon, city, `${city}, ${ipData.region || ''}, ${ipData.country || 'India'}`);
            } else {
              throw new Error('IP lookup failed');
            }
          } catch {
            setDetectingGps(false);
            setError('Please search your location manually.');
          }
        },
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      try {
        const ipRes = await fetch('https://ipwho.is/');
        const ipData = await ipRes.json();
        if (ipData && ipData.success !== false) {
          const lat = ipData.latitude || MBD_LAT;
          const lon = ipData.longitude || MBD_LON;
          const city = ipData.city || 'Detected Location';
          resolveLocationData(lat, lon, city, `${city}, India`);
        }
      } catch {
        setDetectingGps(false);
        setError('Please search your location manually.');
      }
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = item.lat;
    const lon = item.lon;
    const city = item.city || 'Location';

    const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
    const isMahabubabad =
      city.toLowerCase().includes('mahabubabad') ||
      city.toLowerCase().includes('mahbubabad') ||
      item.display_name.toLowerCase().includes('mahabubabad') ||
      dist <= SERVICE_RADIUS_KM;

    const locObj: UserLocation = {
      city: isMahabubabad ? 'Mahabubabad' : city,
      address: item.display_name,
      lat,
      lon,
      isServed: isMahabubabad,
      distanceKm: dist,
    };

    setSelectedLocation(locObj);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleFinalizeLocationAndGoHome = () => {
    if (!selectedLocation) {
      setError('Please select or detect your location before proceeding to the home page.');
      return;
    }

    localStorage.setItem('skipq_user_location', JSON.stringify(selectedLocation));
    localStorage.setItem('skipq_location_prompted', 'true');
    window.dispatchEvent(new Event('skipq_location_change'));
    window.dispatchEvent(new Event('skipq_auth_change'));
    router.push('/');
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 space-y-6">
      <div className="glass p-8 sm:p-10 rounded-[3rem] shadow-2xl space-y-6 text-center">
        {/* Brand Shield Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30">
          {step === 'LOCATION' ? <Compass className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
        </div>

        {/* Header Titles */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 'DETAILS' && 'Patient Registration'}
            {step === 'OTP' && 'Verify Email OTP'}
            {step === 'PASSWORD' && 'Set Account Password'}
            {step === 'LOCATION' && 'Select Your Location'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {step === 'DETAILS' && 'Step 1 of 4: Enter your contact details'}
            {step === 'OTP' && `Step 2 of 4: Code sent to ${email}`}
            {step === 'PASSWORD' && 'Step 3 of 4: Create a secure password for future logins'}
            {step === 'LOCATION' && 'Step 4 of 4: Set your location to view hospital queues and live tokens'}
          </p>
        </div>

        {/* PROMINENT ACTIVE EMAIL NOTICE DIALOGUE */}
        {step === 'DETAILS' && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-left flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-blue-600 dark:text-blue-400 font-bold block mb-0.5">
                Active Email Required:
              </strong>
              We will send a 6-digit OTP verification code to your email. Please make sure to enter your active, accessible email address to complete registration.
            </p>
          </div>
        )}

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
                  placeholder="Enter active email (e.g. name@gmail.com)"
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
                <span className="text-[11px] font-bold text-blue-500">
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} left
                </span>
              </div>
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
              disabled={loading || attemptsRemaining <= 0}
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

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-slate-500 hover:text-slate-700 font-bold"
              >
                ← Edit email / phone
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || resending}
                className="text-blue-500 hover:underline font-bold disabled:opacity-40 disabled:no-underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
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
                  <span>Finalizing Password...</span>
                </>
              ) : (
                'Set Password & Select Location ➔'
              )}
            </button>
          </form>
        )}

        {/* STEP 4: MANDATORY LOCATION SELECTION DIALOGUE BEFORE GOING HOME */}
        {step === 'LOCATION' && (
          <div className="space-y-5 text-left">
            <button
              onClick={handleDetectCurrentLocation}
              disabled={detectingGps}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all"
            >
              {detectingGps ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 animate-pulse" />
                  <span>Use Current Location (Auto-Detect)</span>
                </>
              )}
            </button>

            {/* Fast Location Search */}
            <div className="relative">
              <div className="flex items-center p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search town, landmark, or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                />
                {searching && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-52 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full p-3.5 text-left text-xs font-medium hover:bg-blue-500/10 flex items-start gap-2.5 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="text-slate-800 dark:text-slate-200 line-clamp-2">
                        {item.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Details & Notice */}
            {selectedLocation && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedLocation.isServed
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedLocation.isServed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {selectedLocation.city}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            selectedLocation.isServed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {selectedLocation.isServed ? 'Live In-Service' : 'Service Coming Soon'}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                        {selectedLocation.address}
                      </p>

                      {/* USER REQUESTED EXACT SERVICE NOTICE */}
                      {!selectedLocation.isServed ? (
                        <div className="pt-2 text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                          ⚠️ We're serving only in <span className="underline font-black">Mahabubabad</span> right now. We're working hard to bring our services to your location soon!
                        </div>
                      ) : (
                        <p className="text-emerald-700 dark:text-emerald-300 font-bold pt-1">
                          ✅ Live hospital queues and digital consultation tokens are active for your location.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* OpenStreetMap Embed */}
                <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
                  <iframe
                    title="Location Map Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lon - 0.03}%2C${selectedLocation.lat - 0.03}%2C${selectedLocation.lon + 0.03}%2C${selectedLocation.lat + 0.03}&layer=mapnik&marker=${selectedLocation.lat}%2C${selectedLocation.lon}`}
                    className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                    OpenStreetMap
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeLocationAndGoHome}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Confirm Location & Enter Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <p className="text-[11px] font-medium text-slate-500 pt-2">
          Skip-Q Official Healthcare Platform
        </p>
      </div>
    </div>
  );
}
