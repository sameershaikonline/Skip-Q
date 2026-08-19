'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [currentLiveToken, setCurrentLiveToken] = useState<number>(1);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [updating, setUpdating] = useState(false);

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
    const interval = setInterval(fetchHospitalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateLiveToken = async (newToken: number) => {
    if (newToken < 1) return;
    setUpdating(true);
    setCurrentLiveToken(newToken);

    const hospitalId = hospital?.id || localStorage.getItem('hospital_id');
    if (!hospitalId) return;

    try {
      await fetch(`/api/hospitals/${hospitalId}/live-token`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveToken: String(newToken) }),
      });
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
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-semibold">Verifying Hospital Authorization...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-black text-white">{hospitalName}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
              Verified Reception Desk
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {hospitalEmail ? `Logged in as: ${hospitalEmail}` : 'Hospital Reception Operations'} • Update live tokens as patients enter the doctor's room.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHospitalData}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800"
          >
            🔄 Sync Queue
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* RECEPTIONIST LIVE TOKEN CONTROLLER HERO */}
      <div className="bg-slate-900 rounded-3xl border-2 border-indigo-500/50 p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block">
              ● RECEPTIONIST ACTIVE CONTROLLER
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              Currently Taking Medication / Consultation in Doctor's Room
            </h2>
            <p className="text-xs text-slate-400">
              When patient enters room, click "Call Next Token" to update the live profile and notify upcoming patients.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSetManualToken} className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Set Token #"
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="w-28 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-2.5 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Set
              </button>
            </form>
          </div>
        </div>

        {/* Live Token Display & Main Increment Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Active Token Box */}
          <div className="p-8 bg-slate-950 rounded-3xl border border-indigo-500/40 text-center space-y-2 shadow-inner">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CURRENT LIVE TOKEN IN ROOM
            </span>
            <div className="text-7xl font-mono font-black text-indigo-400 tracking-wider">
              #{currentLiveToken}
            </div>
            <span className="text-xs text-emerald-400 font-bold block animate-pulse">
              ● Visible Live on Hospital Profile & Patient Apps
            </span>
          </div>

          {/* Quick Increment Controls */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={handleCallNext}
              disabled={updating}
              className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📢</span>
              <span>CALL NEXT TOKEN (#{currentLiveToken + 1}) →</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCallPrevious}
                disabled={currentLiveToken <= 1 || updating}
                className="py-3 bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-40"
              >
                ← Previous Token (#{Math.max(1, currentLiveToken - 1)})
              </button>
              <button
                onClick={() => handleUpdateLiveToken(currentLiveToken)}
                disabled={updating}
                className="py-3 bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                🔔 Re-Broadcast Current Token (#{currentLiveToken})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OPD Queue List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Today's Patient OPD Queue</h3>
            <p className="text-xs text-slate-400">Tokens issued and waiting for consultation</p>
          </div>
          <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {appointments.length} Total Patients
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p>No patient queue tokens booked for today yet.</p>
            <p className="text-[11px] text-slate-600">New patient bookings from the Patient Web App will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-400">#{apt.token?.tokenNumber || idx + 1}</td>
                    <td className="p-3 font-semibold text-white">{apt.patient?.name || apt.patientName || 'Patient'}</td>
                    <td className="p-3 text-slate-400">{apt.patient?.phone || '—'}</td>
                    <td className="p-3 text-slate-400">{apt.timeSlot}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
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
