'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  Activity,
  Plus,
  ArrowRight
} from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Patient Consultation Dashboard</h1>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
              Active Queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with hospital outpatient departments in Mahabubabad
          </p>
        </div>

        <Link
          href="/"
          className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Appointment Token</span>
        </Link>
      </div>

      {/* Real-Time Queue Monitor */}
      {activeAppt && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-semibold text-teal-800 uppercase tracking-wider block">
                Active Queue Countdown
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                {activeAppt.hospitalName || activeAppt.hospital?.name || 'Hospital Consultation'}
              </h2>
              <p className="text-xs text-slate-500">
                Doctor: {activeAppt.doctor?.name || 'General Practitioner'} • Window: {activeAppt.timeSlot}
              </p>
            </div>

            <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Live Queue Sync</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Live Token In Room */}
            <div className="p-5 bg-slate-900 rounded-lg text-white space-y-1">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Currently in Doctor Room
              </span>
              <div className="text-4xl font-mono font-bold text-teal-400">
                #{activeLiveToken}
              </div>
              <span className="text-[11px] text-slate-400 block pt-0.5">Consultation in progress</span>
            </div>

            {/* Your Token */}
            <div className="p-5 bg-teal-700 rounded-lg text-white space-y-1">
              <span className="text-[10px] text-teal-100 font-medium uppercase tracking-wider block">
                Your Assigned Token
              </span>
              <div className="text-4xl font-mono font-bold text-white">
                #{activeAppt.token?.tokenNumber || '1'}
              </div>
              <span className="text-[11px] text-teal-100 block pt-0.5">Present at registration counter</span>
            </div>

            {/* Waiting Count */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 space-y-1">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                Tokens Ahead of You
              </span>
              <div className="text-4xl font-mono font-bold text-slate-900">
                {tokensAhead === 0 ? 'Your Turn' : `${tokensAhead}`}
              </div>
              <span className="text-[11px] text-slate-500 block pt-0.5">
                {tokensAhead === 0 ? 'Please proceed to room' : `Est. Wait: ~${tokensAhead * 15} Mins`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Appointment History Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-semibold text-slate-900">Appointment Record</h3>
          <p className="text-xs text-slate-500">History of digital tokens issued for your account</p>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <p>No active appointments scheduled for today.</p>
            <Link
              href="/"
              className="text-teal-700 font-medium hover:underline inline-block"
            >
              Browse hospital directory to book a token
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Token</th>
                  <th className="p-2.5">Hospital</th>
                  <th className="p-2.5">Practitioner</th>
                  <th className="p-2.5">Schedule</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-semibold text-teal-800">
                      #{apt.token?.tokenNumber || idx + 1}
                    </td>
                    <td className="p-2.5 font-medium text-slate-900">
                      {apt.hospitalName || apt.hospital?.name || 'Hospital'}
                    </td>
                    <td className="p-2.5 text-slate-600">{apt.doctor?.name || 'General OPD'}</td>
                    <td className="p-2.5 text-slate-500">
                      {apt.appointmentDate} • {apt.timeSlot}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
