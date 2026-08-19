'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  RefreshCw,
  LogOut,
  Stethoscope,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

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
    setTokenNotification(`Broadcasting Token #${newToken}...`);

    const hospitalId = hospital?.id || localStorage.getItem('hospital_id');
    if (!hospitalId) return;

    try {
      await fetch(`/api/hospitals/${hospitalId}/live-token`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveToken: String(newToken) }),
      });
      setTokenNotification(`Token #${newToken} is live on Patient Apps!`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="loader-ring"></div>
        <p className="font-black animate-pulse text-slate-500 uppercase tracking-widest text-xs">
          Verifying Session...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{hospitalName}</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {hospitalEmail} • {hospital?.address || 'Mahabubabad'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            className="px-5 py-2.5 glass text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl hover:scale-105 transition-transform"
          >
            Doctors Roster
          </Link>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-500/10 text-rose-500 font-bold text-xs rounded-2xl hover:bg-rose-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {tokenNotification && (
        <div className="p-4 bg-blue-600 text-white font-bold text-sm rounded-2xl text-center shadow-xl shadow-blue-500/30 animate-in fade-in">
          {tokenNotification}
        </div>
      )}

      {/* OPD CALLER DESK */}
      <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-8 border-2 border-blue-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-500 block">
              ● RECEPTION CONTROLLER
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Live Consultation Room Caller
            </h2>
          </div>

          <form onSubmit={handleSetManualToken} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Jump to #"
              value={manualTokenInput}
              onChange={(e) => setManualTokenInput(e.target.value)}
              className="w-32 p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-mono text-center font-bold outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-2xl hover:scale-105 transition-transform"
            >
              Set
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Big Live Token Box */}
          <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-center text-white shadow-2xl shadow-blue-500/30 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-200 block">
              CURRENT IN ROOM
            </span>
            <div className="text-7xl font-mono font-black">
              #{currentLiveToken}
            </div>
            <span className="text-xs text-blue-200 font-bold block pt-1 animate-pulse">
              ● Broadcasting Live
            </span>
          </div>

          {/* Caller Actions */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={handleCallNext}
              disabled={updating}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-[2.5rem] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <span>Call Next Patient (Token #{currentLiveToken + 1})</span>
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCallPrevious}
                disabled={currentLiveToken <= 1 || updating}
                className="py-4 glass text-slate-700 dark:text-slate-200 font-bold text-sm rounded-[2rem] disabled:opacity-40 hover:scale-105 transition-transform"
              >
                ← Prev (#{Math.max(1, currentLiveToken - 1)})
              </button>

              <button
                onClick={() => handleUpdateLiveToken(currentLiveToken)}
                disabled={updating}
                className="py-4 glass text-slate-700 dark:text-slate-200 font-bold text-sm rounded-[2rem] hover:scale-105 transition-transform"
              >
                Re-Announce Token #{currentLiveToken}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OPD Patients Table */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Today's OPD Queue</h3>
        {appointments.length === 0 ? (
          <p className="text-sm font-medium text-slate-500 text-center py-6">No patient appointments booked yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="text-slate-400 uppercase font-black text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx}>
                    <td className="p-3 font-mono font-black text-blue-500 text-sm">#{apt.token?.tokenNumber || idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{apt.patient?.name || 'Patient'}</td>
                    <td className="p-3 text-slate-500">{apt.patient?.phone || '—'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{apt.timeSlot}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-500">
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
