'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
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
    setLoading(false);

    // Sync live token of the first hospital in list
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">Hello, {userName}</span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
              Active Patient
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Live queue monitor synchronized directly with the hospital reception desk.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
        >
          + Book Another Token
        </Link>
      </div>

      {/* LIVE QUEUE RADAR HERO */}
      {activeAppt && (
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                ● LIVE QUEUE COUNTDOWN
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {activeAppt.hospitalName || activeAppt.hospital?.name || 'Clinic Consultation'}
              </h2>
              <p className="text-xs text-slate-500">
                Doctor: {activeAppt.doctor?.name || 'Specialist Doctor'} • {activeAppt.timeSlot}
              </p>
            </div>

            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>Live Queue Syncing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Live Token In Room */}
            <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                CURRENTLY IN ROOM
              </span>
              <div className="text-5xl font-mono font-black text-emerald-400">
                #{activeLiveToken}
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">Inside with doctor now</span>
            </div>

            {/* Your Token Number */}
            <div className="p-6 bg-emerald-600 rounded-2xl text-white space-y-1 shadow-md shadow-emerald-600/20">
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">
                YOUR ASSIGNED TOKEN
              </span>
              <div className="text-5xl font-mono font-black text-white">
                #{activeAppt.token?.tokenNumber || '1'}
              </div>
              <span className="text-[11px] text-emerald-100 block pt-1">Show at reception desk</span>
            </div>

            {/* Tokens Ahead / Wait Time */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                PATIENTS AHEAD OF YOU
              </span>
              <div className="text-5xl font-mono font-black text-indigo-600">
                {tokensAhead === 0 ? 'Your Turn!' : `${tokensAhead}`}
              </div>
              <span className="text-[11px] text-slate-500 block pt-1">
                {tokensAhead === 0 ? 'Please proceed to consultation room' : `Est. Wait: ~${tokensAhead * 15} Mins`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Booked Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Your Appointment History</h3>
          <p className="text-xs text-slate-500">All digital queue tokens generated on Skip-Q</p>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <span className="text-3xl block">🎟️</span>
            <p className="font-semibold text-slate-700">You haven't booked any OPD tokens yet.</p>
            <Link
              href="/"
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow inline-block"
            >
              Explore Hospitals & Book Token ➔
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Token #</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-700 text-sm">
                      #{apt.token?.tokenNumber || idx + 1}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {apt.hospitalName || apt.hospital?.name || 'Hospital'}
                    </td>
                    <td className="p-3 text-slate-600">{apt.doctor?.name || 'Specialist Doctor'}</td>
                    <td className="p-3 text-slate-500">
                      {apt.appointmentDate} • {apt.timeSlot}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
