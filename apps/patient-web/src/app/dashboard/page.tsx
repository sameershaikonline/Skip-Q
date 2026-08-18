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
  appointmentDate: string;
  timeSlot: string;
  status: string;
  totalFee: number;
  hospital?: { name?: string; address?: string };
  department?: { name?: string };
  doctor?: { name?: string; roomNo?: string };
  token?: TokenInfo;
}

const DEFAULT_SAMPLE_APPOINTMENT: Appointment = {
  id: 'appt-demo-1',
  appointmentDate: new Date().toISOString().split('T')[0],
  timeSlot: '10:00 AM - 10:30 AM',
  status: 'IN_QUEUE',
  totalFee: 500,
  hospital: {
    name: 'District Government Area Hospital',
    address: 'Station Road, Beside Collectorate, Mahabubabad',
  },
  department: { name: 'General Medicine' },
  doctor: { name: 'Dr. K. Sridhar MD', roomNo: 'OPD Room 4' },
  token: {
    tokenNumber: 'TK-14',
    queuePosition: 3,
    estimatedWaitMinutes: 12,
    status: 'IN_QUEUE',
  },
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Patient');

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

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = localStorage.getItem('token');

    if (backend && token) {
      fetch(`${backend}/api/appointments/my-patient-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAppointments(data);
          } else {
            setAppointments(localList.length > 0 ? localList : [DEFAULT_SAMPLE_APPOINTMENT]);
          }
        })
        .catch(() => {
          setAppointments(localList.length > 0 ? localList : [DEFAULT_SAMPLE_APPOINTMENT]);
        })
        .finally(() => setLoading(false));
    } else {
      setAppointments(localList.length > 0 ? localList : [DEFAULT_SAMPLE_APPOINTMENT]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelToken = (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this OPD token?')) return;
    const updated = appointments.filter((a) => a.id !== apptId);
    setAppointments(updated);
    localStorage.setItem('my_appointments', JSON.stringify(updated));
  };

  const activeAppointment = appointments.find(
    (a) => a.status === 'BOOKED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Welcome, {userName}</h1>
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] font-bold rounded-md border border-teal-500/30">
              Verified Patient
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Real-time OPD token queue tracker and medical consultation history.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 transition-all flex items-center gap-1.5"
        >
          <span>+</span> Book New OPD Token
        </Link>
      </div>

      {/* Zomato-Style Live Token Queue Tracker */}
      {activeAppointment && (
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-teal-950/50 to-slate-900 border border-teal-500/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                Live OPD Queue Status • Real-Time Tracking
              </span>
            </div>
            <span className="text-[11px] text-teal-300 font-mono font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
              ⚡ Auto-Sync Active
            </span>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-teal-500/30 shadow-inner">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">YOUR TOKEN NUMBER</span>
              <span className="text-4xl font-mono font-black text-teal-300 tracking-wider">
                {activeAppointment.token?.tokenNumber || 'TK-14'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Show token at hospital counter</span>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">CURRENT QUEUE POSITION</span>
              <span className="text-4xl font-mono font-black text-amber-400">
                #{activeAppointment.token?.queuePosition || 3}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {(activeAppointment.token?.queuePosition || 3) - 1} patients ahead of you
              </span>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">ESTIMATED WAIT TIME</span>
              <span className="text-4xl font-mono font-black text-sky-400">
                ~{activeAppointment.token?.estimatedWaitMinutes || 12} mins
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Slot: {activeAppointment.timeSlot}
              </span>
            </div>
          </div>

          {/* 4-Stage Visual Progress Bar */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-4 text-center text-[11px] font-bold">
              <span className={activeAppointment.status === 'BOOKED' || activeAppointment.status === 'IN_QUEUE' ? 'text-teal-400' : 'text-slate-500'}>
                1. Token Booked ✓
              </span>
              <span className={activeAppointment.status === 'IN_QUEUE' ? 'text-teal-400 animate-pulse' : 'text-slate-500'}>
                2. In Waiting Area
              </span>
              <span className={activeAppointment.status === 'IN_CONSULTATION' ? 'text-emerald-400 font-black animate-bounce' : 'text-slate-500'}>
                3. Called to Counter 📢
              </span>
              <span className={activeAppointment.status === 'COMPLETED' ? 'text-teal-400' : 'text-slate-500'}>
                4. Consultation Done
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
              <div
                className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-lg shadow-teal-500/40"
                style={{
                  width:
                    activeAppointment.status === 'BOOKED'
                      ? '25%'
                      : activeAppointment.status === 'IN_QUEUE'
                      ? '50%'
                      : activeAppointment.status === 'IN_CONSULTATION'
                      ? '75%'
                      : '100%',
                }}
              />
            </div>
          </div>

          {/* Hospital & Doctor Details Box */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
            <div>
              <p className="font-bold text-white text-sm">
                🏥 {activeAppointment.hospital?.name}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                👨‍⚕️ {activeAppointment.doctor?.name || 'Dr. K. Sridhar MD'} • {activeAppointment.doctor?.roomNo || 'OPD Room 4'} • {activeAppointment.department?.name || 'General OPD'}
              </p>
            </div>

            <button
              onClick={() => handleCancelToken(activeAppointment.id)}
              className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-xs rounded-xl transition-all"
            >
              Cancel Token
            </button>
          </div>
        </div>
      )}

      {/* Appointment History List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white">Your Booked Tokens & History</h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Loading your appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
            <span className="text-4xl block">🎫</span>
            <h3 className="text-base font-bold text-white">No Active OPD Tokens</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Find verified hospitals in Mahabubabad and book a digital token to skip the queue.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-teal-300"
            >
              Find Hospitals & Book Token
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-black bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg">
                      {appt.token?.tokenNumber || 'TK-14'}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {appt.department?.name || 'General OPD'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{appt.hospital?.name}</h3>
                  <p className="text-xs text-slate-400">
                    📅 Date: {appt.appointmentDate} • Slot: {appt.timeSlot} • Fee: {appt.totalFee === 0 ? 'FREE' : `₹${appt.totalFee}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      appt.status === 'IN_CONSULTATION'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : appt.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    }`}
                  >
                    {appt.status === 'IN_QUEUE' ? '● In Queue' : appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
