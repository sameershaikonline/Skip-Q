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
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLiveToken, setCurrentLiveToken] = useState<number>(10);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const [hospitalName, setHospitalName] = useState('Hospital Management');
  const [hospitalEmail, setHospitalEmail] = useState('');

  const fetchHospitalData = async () => {
    const token = localStorage.getItem('hospital_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const savedName = localStorage.getItem('hospital_name');
    const savedEmail = localStorage.getItem('hospital_email');
    if (savedName) setHospitalName(savedName);
    if (savedEmail) setHospitalEmail(savedEmail);

    const hospitalId = localStorage.getItem('hospital_id') || 'hosp_active';
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const apptsUrl = backend
      ? `${backend}/api/appointments/hospital-appointments`
      : '/api/appointments/hospital-appointments';

    try {
      const res = await fetch(apptsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAppointments(data);
      }
    } catch {
      const raw = localStorage.getItem('my_appointments');
      if (raw) {
        try { setAppointments(JSON.parse(raw)); } catch {}
      }
    }

    const hospUrl = backend ? `${backend}/api/hospitals/${hospitalId}` : `/api/hospitals/${hospitalId}`;
    try {
      const res = await fetch(hospUrl);
      if (res.ok) {
        const hData = await res.json();
        setHospital(hData);
        if (hData.currentLiveToken) {
          setCurrentLiveToken(Number(hData.currentLiveToken));
        }
      }
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('hospital_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchHospitalData();
    const interval = setInterval(fetchHospitalData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateLiveToken = async (newToken: number) => {
    setUpdating(true);
    setCurrentLiveToken(newToken);

    const hospitalId = hospital?.id || localStorage.getItem('hospital_id') || 'hosp_active';
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = backend
      ? `${backend}/api/hospitals/${hospitalId}/live-token`
      : `/api/hospitals/${hospitalId}/live-token`;

    try {
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveToken: String(newToken) }),
      });
    } catch (err) {
      console.warn('Backend update failed:', err);
    } finally {
      setUpdating(false);
      fetchHospitalData();
    }
  };

  const handleCallNext = () => {
    const next = currentLiveToken + 1;
    handleUpdateLiveToken(next);
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
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_id');
    localStorage.removeItem('hospital_name');
    localStorage.removeItem('hospital_email');
    router.push('/auth/login');
  };

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
                className="py-3 bg-slate-950 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                🔔 Re-Broadcast Current Token (#{currentLiveToken})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-black text-white">Today's Registered Patient Tokens</h2>
            <p className="text-xs text-slate-400">All patients who booked an OPD token at this hospital.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Bookings: {appointments.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
              Loading hospital bookings...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-3xl block">🎫</span>
              <p className="font-bold text-white text-sm">No Patient Tokens Booked Yet</p>
              <p className="text-slate-500">When patients book appointment tokens from the patient web app, they will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">TOKEN #</th>
                  <th className="p-3">PATIENT NAME</th>
                  <th className="p-3">APPOINTMENT DATE & SLOT</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((item, idx) => {
                  const tokenNum = item.token?.tokenNumber || item.tokenNumber || `${idx + 1}`;
                  const isCurrent = Number(tokenNum) === currentLiveToken;
                  const isPast = Number(tokenNum) < currentLiveToken;

                  return (
                    <tr key={item.id || idx} className={`hover:bg-slate-950/40 ${isCurrent ? 'bg-indigo-500/10' : ''}`}>
                      <td className="p-3 font-mono font-black text-sm text-indigo-400">
                        Token #{tokenNum}
                      </td>
                      <td className="p-3 font-semibold text-white">
                        {item.patientName || item.patient?.name || 'Patient'}
                      </td>
                      <td className="p-3 text-slate-400">
                        {item.appointmentDate} ({item.timeSlot})
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                              : isPast
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isCurrent ? '● IN DOCTOR ROOM' : isPast ? 'COMPLETED' : 'IN WAITING AREA'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleUpdateLiveToken(Number(tokenNum))}
                          className="px-3 py-1 bg-indigo-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-indigo-400"
                        >
                          Call Token #{tokenNum}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
