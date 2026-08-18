'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  totalFee: number;
  hospital?: { name: string; address: string };
  department?: { name: string };
  token?: { tokenNumber: string; queuePosition: number; estimatedWaitMinutes: number; status: string };
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientAppointments = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backend}/api/appointments/my-patient-appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      })
      .catch(() => {
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatientAppointments();
    const interval = setInterval(fetchPatientAppointments, 5000); // Polling for live status sync
    return () => clearInterval(interval);
  }, []);

  const activeAppointment = appointments.find(
    (a) => a.status === 'BOOKED' || a.status === 'IN_QUEUE' || a.status === 'IN_CONSULTATION'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Patient Appointments & Live Tracker</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time OPD token queue tracking and consultation history in Mahabubabad.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-teal-400 transition-colors"
        >
          + Book New Token
        </Link>
      </div>

      {/* Zomato-Style Live Token Queue Tracker Bar */}
      {activeAppointment && (
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live OPD Queue Tracker • Real-time Sync
              </span>
            </div>
            <button onClick={fetchPatientAppointments} className="text-xs text-slate-400 hover:text-teal-400">
              🔄 Sync Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">YOUR TOKEN NUMBER</span>
              <span className="text-3xl font-black text-teal-400">
                {activeAppointment.token?.tokenNumber || 'TK-101'}
              </span>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">QUEUE POSITION</span>
              <span className="text-3xl font-black text-amber-400">
                #{activeAppointment.token?.queuePosition || 1}
              </span>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">ESTIMATED WAIT</span>
              <span className="text-3xl font-black text-sky-400">
                {activeAppointment.token?.estimatedWaitMinutes || 15} mins
              </span>
            </div>
          </div>

          {/* Visual Zomato-Style Order Status Step Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className={activeAppointment.status === 'BOOKED' ? 'text-teal-400' : 'text-slate-500'}>
                1. Token Booked
              </span>
              <span className={activeAppointment.status === 'IN_QUEUE' ? 'text-teal-400' : 'text-slate-500'}>
                2. In Queue
              </span>
              <span className={activeAppointment.status === 'IN_CONSULTATION' ? 'text-emerald-400 font-extrabold animate-pulse' : 'text-slate-500'}>
                3. Called to Counter 📢
              </span>
              <span className={activeAppointment.status === 'COMPLETED' ? 'text-teal-400' : 'text-slate-500'}>
                4. Completed
              </span>
            </div>

            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
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
              ></div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
            <span>🏥 {activeAppointment.hospital?.name || 'Hospital'} • Slot: {activeAppointment.timeSlot}</span>
            <span className="text-emerald-400 font-bold">
              {activeAppointment.status === 'IN_CONSULTATION'
                ? '📢 Your token has been called to the OPD Consultation counter!'
                : 'Please stay near the hospital consultation counter'}
            </span>
          </div>
        </div>
      )}

      {/* Appointments List Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Appointment History & Tokens</h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
            Loading your appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
            <span className="text-4xl block">🎫</span>
            <h3 className="text-base font-bold text-white">No Appointments or Tokens Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Search verified hospitals in Mahabubabad to book your first digital OPD queue token.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-teal-300"
            >
              Find Hospitals in Mahabubabad
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {appt.token && (
                      <span className="px-2.5 py-0.5 text-xs font-black bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded">
                        Token {appt.token.tokenNumber}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-400">{appt.department?.name || 'General OPD'}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{appt.hospital?.name}</h3>
                  <p className="text-xs text-slate-300">📅 {appt.appointmentDate} • Slot: {appt.timeSlot}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      appt.status === 'IN_CONSULTATION'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : appt.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {appt.status}
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
