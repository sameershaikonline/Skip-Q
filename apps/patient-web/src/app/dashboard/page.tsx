'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TokenInfo {
  tokenNumber: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: string;
}

interface Appointment {
  id: string;
  hospitalId?: string;
  hospitalName?: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  hospital?: { id?: string; name?: string; address?: string; currentLiveToken?: string };
  doctor?: { name?: string; roomNo?: string };
  token?: TokenInfo;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userName, setUserName] = useState('Patient');
  const [activeLiveToken, setActiveLiveToken] = useState<number>(1);

  const loadAppointments = () => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) setUserName(u.name);
      }
    } catch {}

    const rawAppts = localStorage.getItem('my_appointments');
    let localList: Appointment[] = [];
    if (rawAppts) {
      try { localList = JSON.parse(rawAppts); } catch {}
    }
    setAppointments(localList);

    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((hList) => {
        if (Array.isArray(hList) && hList.length > 0) {
          setActiveLiveToken(Number(hList[0].currentLiveToken) || 1);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeAppt = appointments[0];
  const userTokenNum = activeAppt?.token?.tokenNumber ? Number(activeAppt.token.tokenNumber) : null;
  const tokensAhead = userTokenNum ? Math.max(0, userTokenNum - activeLiveToken) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Hello, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time outpatient queue live countdown
          </p>
        </div>

        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          + Book New Token
        </Link>
      </div>

      {/* Live Countdown Display */}
      {activeAppt && (
        <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-8 border-2 border-blue-500/20">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-500">
              ● REAL-TIME QUEUE SYNC
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
              {activeAppt.hospitalName || 'Outpatient Consultation'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Doctor: {activeAppt.doctor?.name || 'Attending Physician'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-center text-white space-y-2 shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                CURRENT IN ROOM
              </span>
              <div className="text-6xl font-mono font-black text-emerald-400">
                #{activeLiveToken}
              </div>
              <span className="text-xs text-slate-400 block">Doctor attending</span>
            </div>

            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] text-center text-white space-y-2 shadow-xl shadow-blue-500/20">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-200 block">
                YOUR TOKEN
              </span>
              <div className="text-6xl font-mono font-black text-white">
                #{activeAppt.token?.tokenNumber || '1'}
              </div>
              <span className="text-xs text-blue-200 block font-bold">Your queue pass</span>
            </div>

            <div className="p-8 glass rounded-[2.5rem] text-center space-y-2 shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
                PATIENTS AHEAD
              </span>
              <div className="text-6xl font-mono font-black text-blue-600 dark:text-blue-400">
                {tokensAhead === 0 ? 'Now!' : tokensAhead}
              </div>
              <span className="text-xs text-slate-500 block font-bold">
                {tokensAhead === 0 ? 'Proceed to doctor room' : `Est. Wait: ~${tokensAhead * 15} Mins`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Your Appointments</h3>
        {appointments.length === 0 ? (
          <p className="text-sm font-medium text-slate-500 text-center py-6">No appointments booked yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="text-slate-400 uppercase font-black text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Token</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx}>
                    <td className="p-3 font-mono font-black text-blue-500 text-sm">
                      #{apt.token?.tokenNumber || idx + 1}
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {apt.hospitalName || 'Hospital'}
                    </td>
                    <td className="p-3 text-slate-500">{apt.doctor?.name || 'General OPD'}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-500">
                        {apt.status || 'CONFIRMED'}
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
