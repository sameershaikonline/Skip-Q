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
  appointmentDate: string;
  timeSlot: string;
  status: string;
  totalFee: number;
  hospital?: { id?: string; name?: string; address?: string; currentLiveToken?: string };
  department?: { name?: string };
  doctor?: { name?: string; roomNo?: string };
  token?: TokenInfo;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Patient');
  const [liveHospitalToken, setLiveHospitalToken] = useState<number>(10);

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
            setAppointments(localList);
          }
        })
        .catch(() => setAppointments(localList))
        .finally(() => setLoading(false));
    } else {
      setAppointments(localList);
      setLoading(false);
    }

    // Check active hospital's live token
    const activeAppt = localList[0];
    const hospitalId = activeAppt?.hospitalId || 'hosp_active';
    const hospUrl = backend ? `${backend}/api/hospitals/${hospitalId}` : `/api/hospitals/${hospitalId}`;

    fetch(hospUrl)
      .then((res) => res.json())
      .then((hData) => {
        if (hData && hData.currentLiveToken) {
          setLiveHospitalToken(Number(hData.currentLiveToken));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAppointments();
    // Poll every 3 seconds to ensure instant receptionist call updates
    const interval = setInterval(loadAppointments, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelToken = (apptId: string) => {
    if (!confirm('Are you sure you want to cancel this OPD token?')) return;
    const updated = appointments.filter((a) => a.id !== apptId);
    setAppointments(updated);
    localStorage.setItem('my_appointments', JSON.stringify(updated));
  };

  const activeAppointment = appointments[0];
  const myTokenNum = Number(activeAppointment?.token?.tokenNumber || '14');
  const isMyTurn = myTokenNum === liveHospitalToken;
  const isAlreadyServed = myTokenNum < liveHospitalToken;
  const patientsAhead = Math.max(0, myTokenNum - liveHospitalToken);

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
            Real-time OPD token queue tracker — automatically updated by hospital receptionists.
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 transition-all flex items-center gap-1.5"
        >
          <span>+</span> Book New OPD Token
        </Link>
      </div>

      {/* RECEPTIONIST SYNCHRONIZED LIVE TOKEN TRACKER */}
      {activeAppointment && (
        <div
          className={`relative rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 transition-all ${
            isMyTurn
              ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border-emerald-400/80 shadow-emerald-500/20 animate-pulse'
              : 'bg-gradient-to-r from-slate-900 via-teal-950/50 to-slate-900 border-teal-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                {isMyTurn ? '🚨 URGENT: IT IS YOUR TURN NOW!' : 'Live Reception OPD Sync Active'}
              </span>
            </div>
            <span className="text-[11px] text-teal-300 font-mono font-bold bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
              ● Live Sync: Every 3s
            </span>
          </div>

          {/* Callout Message when it's patient turn */}
          {isMyTurn && (
            <div className="p-4 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl text-center space-y-1">
              <h3 className="text-lg font-black text-white">
                📢 TOKEN #{myTokenNum} CALLED TO DOCTOR ROOM!
              </h3>
              <p className="text-xs text-emerald-200">
                Please proceed directly to {activeAppointment.doctor?.roomNo || 'OPD Room 4'} for your consultation.
              </p>
            </div>
          )}

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Live Token in Room */}
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-indigo-500/50 shadow-inner">
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block">
                CURRENTLY IN DOCTOR ROOM
              </span>
              <span className="text-4xl font-mono font-black text-indigo-300 tracking-wider">
                Token #{liveHospitalToken}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Updated by hospital receptionist</span>
            </div>

            {/* Patient Token Number */}
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-teal-500/50 shadow-inner">
              <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider block">
                YOUR ASSIGNED TOKEN
              </span>
              <span className="text-4xl font-mono font-black text-teal-300 tracking-wider">
                Token #{myTokenNum}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Slot: {activeAppointment.timeSlot}</span>
            </div>

            {/* Queue Status */}
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                QUEUE STATUS
              </span>
              <span className="text-4xl font-mono font-black text-amber-400">
                {isMyTurn ? 'ENTER ROOM' : isAlreadyServed ? 'COMPLETED' : `${patientsAhead} Ahead`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {isMyTurn ? 'Active now' : isAlreadyServed ? 'Consultation completed' : `~${patientsAhead * 5} mins estimated wait`}
              </span>
            </div>
          </div>

          {/* Hospital & Doctor Details Box */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
            <div>
              <p className="font-bold text-white text-sm">
                🏥 {activeAppointment.hospital?.name || 'District Government Area Hospital'}
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
              Find registered hospitals in Mahabubabad and book your digital token to track live queue numbers.
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
            {appointments.map((appt) => {
              const tokenNum = Number(appt.token?.tokenNumber || '14');
              const isServing = tokenNum === liveHospitalToken;
              const isDone = tokenNum < liveHospitalToken;

              return (
                <div
                  key={appt.id}
                  className="p-5 bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-black bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg">
                        Token #{tokenNum}
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
                        isServing
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                          : isDone
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                      }`}
                    >
                      {isServing ? '● IN DOCTOR ROOM NOW' : isDone ? 'COMPLETED' : '● WAITING IN QUEUE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
