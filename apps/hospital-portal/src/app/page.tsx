'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Users,
  RefreshCw,
  LogOut,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Clock,
  CheckCircle2
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
      setTokenNotification(`Token #${newToken} broadcasted to patient devices.`);
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
      <div className="max-w-md mx-auto my-32 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{hospitalName}</h1>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
              Reception Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hospitalEmail} • {hospital?.address || 'Mahabubabad'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/doctors"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors</span>
          </Link>
          <button
            onClick={fetchHospitalData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg transition-colors border border-rose-200 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {tokenNotification && (
        <div className="p-3 bg-teal-800 text-white text-xs font-medium rounded-lg text-center shadow-sm">
          {tokenNotification}
        </div>
      )}

      {/* OPD TOKEN CALLING CONSOLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Outpatient Queue Controller
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Live Room Calling Desk
            </h2>
          </div>

          <form onSubmit={handleSetManualToken} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Jump to Token #"
              value={manualTokenInput}
              onChange={(e) => setManualTokenInput(e.target.value)}
              className="w-32 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono text-center focus:outline-none focus:border-slate-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800"
            >
              Set
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Big Live Token Box */}
          <div className="p-6 bg-slate-900 rounded-xl text-center space-y-1 text-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Token in Room
            </span>
            <div className="text-6xl font-mono font-bold text-teal-400">
              #{currentLiveToken}
            </div>
            <span className="text-[11px] text-slate-400 block pt-1">
              Broadcasting Live to Patient App
            </span>
          </div>

          {/* Caller Action */}
          <div className="lg:col-span-2 space-y-3">
            <button
              onClick={handleCallNext}
              disabled={updating}
              className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-base rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Call Next Patient (Token #{currentLiveToken + 1})</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleCallPrevious}
                disabled={currentLiveToken <= 1 || updating}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous (#{Math.max(1, currentLiveToken - 1)})</span>
              </button>
              <button
                onClick={() => handleUpdateLiveToken(currentLiveToken)}
                disabled={updating}
                className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center justify-center gap-1"
              >
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span>Re-Broadcast Token #{currentLiveToken}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OPD Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Today's Appointment Log</h3>
            <p className="text-xs text-slate-500">Patient queue registrations synchronized in real time</p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            {appointments.length} Registered Patients
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p>No outpatient appointments booked for today yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Token</th>
                  <th className="p-2.5">Patient Name</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Time Window</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-semibold text-slate-900">#{apt.token?.tokenNumber || idx + 1}</td>
                    <td className="p-2.5 font-medium text-slate-900">{apt.patient?.name || apt.patientName || 'Patient'}</td>
                    <td className="p-2.5 text-slate-500">{apt.patient?.phone || '—'}</td>
                    <td className="p-2.5 text-slate-600">{apt.timeSlot}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
