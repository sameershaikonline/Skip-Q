'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppointmentItem {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  patient?: { name: string; email: string; phone?: string };
  token?: { id: string; tokenNumber: string; queuePosition: number; estimatedWaitMinutes: number; status: string };
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string>('N/A');

  const fetchHospitalAppointments = () => {
    const token = localStorage.getItem('hospital_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backend}/api/appointments/hospital-appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/auth/login');
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
          const active = data.find((a) => a.status === 'IN_CONSULTATION');
          if (active && active.token) {
            setCurrentToken(active.token.tokenNumber);
          } else {
            setCurrentToken('N/A');
          }
        } else {
          setAppointments([]);
        }
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitalAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    const token = localStorage.getItem('hospital_token');
    if (!token) return;

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      await fetch(`${backend}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchHospitalAppointments();
    } catch (err) {
      alert('Failed to update token status');
    }
  };

  const handleCallNext = () => {
    const pendingItem = appointments.find((a) => a.status === 'BOOKED' || a.status === 'IN_QUEUE');
    if (pendingItem) {
      handleUpdateStatus(pendingItem.id, 'IN_CONSULTATION');
    } else {
      alert('No pending tokens in queue right now.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_id');
    router.push('/auth/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Hospital Queue Operations</h1>
          <p className="text-slate-400 text-xs mt-1">Live Token Queue Controller & Patient Consultation Management in Mahabubabad</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHospitalAppointments}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800"
          >
            🔄 Refresh Queue
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "TODAY'S PATIENTS", val: `${appointments.length}`, color: 'text-indigo-400' },
          { label: 'ESTIMATED REVENUE', val: `₹${appointments.length * 500}`, color: 'text-emerald-400' },
          { label: 'ACTIVE IN QUEUE', val: `${appointments.filter((a) => a.status === 'BOOKED' || a.status === 'IN_QUEUE').length}`, color: 'text-amber-400' },
          { label: 'COMPLETED TODAY', val: `${appointments.filter((a) => a.status === 'COMPLETED').length}`, color: 'text-sky-400' },
        ].map((w, idx) => (
          <div key={idx} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{w.label}</span>
            <p className={`text-2xl font-black ${w.color}`}>{w.val}</p>
          </div>
        ))}
      </div>

      {/* Live Token Caller Banner */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-indigo-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Live OPD Token Controller</h2>
            <p className="text-xs text-slate-400">Call tokens to counter; live positions automatically update on patient dashboard.</p>
          </div>

          <button
            onClick={handleCallNext}
            className="px-5 py-2.5 bg-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-colors"
          >
            📢 CALL NEXT OPD TOKEN
          </button>
        </div>

        {/* Current Active Token Box */}
        <div className="p-6 bg-slate-950 rounded-2xl border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase block">CURRENTLY AT CONSULTATION COUNTER</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-black text-indigo-400">{currentToken}</span>
              <span className="text-sm font-semibold text-slate-200">
                {appointments.find((a) => a.token?.tokenNumber === currentToken || a.status === 'IN_CONSULTATION')?.patient?.name || 'No Active Consultation'}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
              Loading hospital queue...
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-3xl block">🎫</span>
              <p className="font-bold text-white text-sm">No Queue Tokens Right Now</p>
              <p className="text-slate-500">Tokens generated by patients on the patient web app will appear here in real time.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">TOKEN NO.</th>
                  <th className="p-3">PATIENT NAME</th>
                  <th className="p-3">SLOT & TIME</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">COUNTER ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/40">
                    <td className="p-3 font-mono font-bold text-indigo-400">
                      {item.token?.tokenNumber || 'TK-OPD'}
                    </td>
                    <td className="p-3 font-semibold text-white">{item.patient?.name || 'Patient'}</td>
                    <td className="p-3 text-slate-400">{item.appointmentDate} ({item.timeSlot})</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'IN_CONSULTATION'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : item.status === 'COMPLETED'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {item.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'IN_CONSULTATION')}
                            className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-emerald-400"
                          >
                            Call Counter
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'COMPLETED')}
                            className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-lg hover:bg-indigo-500/30"
                          >
                            Complete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
