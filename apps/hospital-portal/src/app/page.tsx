'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AppointmentItem {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  patientName?: string;
  patient?: { name: string; email: string; phone?: string };
  token?: { id: string; tokenNumber: string; queuePosition: number; estimatedWaitMinutes: number; status: string };
  tokenNumber?: string;
}

interface HospitalProfile {
  id: string;
  name: string;
  address: string;
  city: string;
  currentLiveToken: string;
  email?: string;
  contactNumber?: string;
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [currentLiveToken, setCurrentLiveToken] = useState<number>(1);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [tokenNotification, setTokenNotification] = useState<string>('');

  const [hospitalName, setHospitalName] = useState('Hospital Partner');
  const [hospitalEmail, setHospitalEmail] = useState('');

  const fetchHospitalData = async () => {
    const token = localStorage.getItem('hospital_token');
    const hospitalId = localStorage.getItem('hospital_id');
    const savedName = localStorage.getItem('hospital_name');
    const savedEmail = localStorage.getItem('hospital_email');

    if (!token || !hospitalId) {
      localStorage.clear();
      router.push('/auth/login');
      return;
    }

    if (savedName) setHospitalName(savedName);
    if (savedEmail) setHospitalEmail(savedEmail);

    try {
      const hospRes = await fetch(`/api/hospitals/${hospitalId}`);
      if (hospRes.ok) {
        const hData = await hospRes.json();
        setHospital(hData);
        if (hData.name) setHospitalName(hData.name);
        if (hData.email) setHospitalEmail(hData.email);
        if (hData.currentLiveToken) {
          setCurrentLiveToken(Number(hData.currentLiveToken) || 1);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch hospital details:', err);
    }

    try {
      const apptsRes = await fetch('/api/appointments/hospital-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (apptsRes.ok) {
        const data = await apptsRes.json();
        if (Array.isArray(data)) setAppointments(data);
      }
    } catch {}

    setAuthChecking(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('hospital_token');
    if (!token) {
      localStorage.clear();
      router.push('/auth/login');
      return;
    }
    fetchHospitalData();
    const interval = setInterval(fetchHospitalData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateLiveToken = async (newToken: number) => {
    if (newToken < 1) return;
    setUpdating(true);
    setCurrentLiveToken(newToken);
    setTokenNotification(`Calling Token #${newToken}...`);

    const hospitalId = hospital?.id || localStorage.getItem('hospital_id');
    if (!hospitalId) return;

    try {
      await fetch(`/api/hospitals/${hospitalId}/live-token`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveToken: String(newToken) }),
      });
      setTokenNotification(`Token #${newToken} is live on Patient App!`);
      setTimeout(() => setTokenNotification(''), 3000);
    } catch (err) {
      console.warn('Token update failed:', err);
    } finally {
      setUpdating(false);
      fetchHospitalData();
    }
  };

  const handleCallNext = () => {
    handleUpdateLiveToken(currentLiveToken + 1);
  };

  const handleCallPrevious = () => {
    if (currentLiveToken > 1) {
      handleUpdateLiveToken(currentLiveToken - 1);
    }
  };

  const handleSetManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(manualTokenInput, 10);
    if (!isNaN(num) && num > 0) {
      handleUpdateLiveToken(num);
      setManualTokenInput('');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  if (authChecking) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-600 font-semibold">Verifying Hospital Reception Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Clinic Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900">{hospitalName}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
              Reception Active
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {hospitalEmail ? `Logged in: ${hospitalEmail}` : 'Reception Operations'} • {hospital?.address || 'Mahabubabad'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            👨‍⚕️ Doctors & OPD
          </Link>
          <button
            onClick={fetchHospitalData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            🔄 Sync Queue
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors border border-rose-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {tokenNotification && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl text-center shadow animate-fade-in">
          {tokenNotification}
        </div>
      )}

      {/* RECEPTIONIST LIVE OPD QUEUE CALLER */}
      <div className="bg-white rounded-3xl border-2 border-indigo-600/30 p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider block">
              ● RECEPTIONIST ACTIVE QUEUE DESK
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Consultation Room Live Calling Console
            </h2>
            <p className="text-xs text-slate-500">
              When a patient enters the doctor’s room, click "Call Next Token" to broadcast the updated live token to all waiting patients.
            </p>
          </div>

          <form onSubmit={handleSetManualToken} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Jump to Token #"
              value={manualTokenInput}
              onChange={(e) => setManualTokenInput(e.target.value)}
              className="w-36 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono text-center focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-700"
            >
              Set
            </button>
          </form>
        </div>

        {/* Live Token Display & Large Caller Button */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Big Live Token Box */}
          <div className="p-8 bg-slate-900 rounded-3xl text-center space-y-2 shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CURRENT TOKEN IN ROOM
            </span>
            <div className="text-6xl sm:text-7xl font-mono font-black text-emerald-400 tracking-wider">
              #{currentLiveToken}
            </div>
            <span className="text-xs text-emerald-300 font-medium block animate-pulse">
              ● Broadcasting live on Patient Apps
            </span>
          </div>

          {/* Quick Increment Controls */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={handleCallNext}
              disabled={updating}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📢</span>
              <span>CALL NEXT PATIENT (Token #{currentLiveToken + 1}) →</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCallPrevious}
                disabled={currentLiveToken <= 1 || updating}
                className="py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40"
              >
                ← Previous Token (#{Math.max(1, currentLiveToken - 1)})
              </button>
              <button
                onClick={() => handleUpdateLiveToken(currentLiveToken)}
                disabled={updating}
                className="py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                🔔 Re-Announce Token #{currentLiveToken}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OPD Patients Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today’s OPD Appointments & Tokens</h3>
            <p className="text-xs text-slate-500">List of patient appointments booked through Skip-Q</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            {appointments.length} Total Patients
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">No appointments booked for today yet.</p>
            <p className="text-slate-400">Patients booking through the Patient Web App will automatically sync here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-700">#{apt.token?.tokenNumber || idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{apt.patient?.name || apt.patientName || 'Patient'}</td>
                    <td className="p-3 text-slate-500">{apt.patient?.phone || '—'}</td>
                    <td className="p-3 text-slate-600">{apt.timeSlot}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {apt.status}
                      </span>
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
}
