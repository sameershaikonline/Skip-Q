'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: string;
  roomNo: string;
  fee: number;
  availableTime: string;
}

interface HospitalDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  description?: string;
  rating?: number;
  openHours?: string;
  isEmergency?: boolean;
  isGovernment?: boolean;
  currentLiveToken?: string;
  departments?: Array<{ id: string; name: string }>;
  doctors?: Doctor[];
}

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.id as string;

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<{
    tokenNumber: string;
    queuePosition: number;
    estimatedWait: string;
    doctorName: string;
    timeSlot: string;
  } | null>(null);

  const fetchHospitalDetails = () => {
    if (!hospitalId) return;
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = backend ? `${backend}/api/hospitals/${hospitalId}` : `/api/hospitals/${hospitalId}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Hospital not found');
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setHospital(data);
          if (data.doctors && data.doctors.length > 0 && !selectedDoctor) {
            setSelectedDoctor(data.doctors[0]);
          }
        } else {
          setHospital(null);
        }
      })
      .catch(() => setHospital(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Preload user name if logged in
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) setPatientName(u.name);
      }
    } catch {}

    fetchHospitalDetails();
    const interval = setInterval(fetchHospitalDetails, 5000); // Live poll to sync active token updates from receptionist
    return () => clearInterval(interval);
  }, [hospitalId]);

  const handleBookToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please sign in or register to book your live OPD token.');
      router.push('/auth/login');
      return;
    }

    if (!patientName.trim()) {
      alert('Please enter patient full name.');
      return;
    }

    setBookingLoading(true);

    const generatedTokenNum = String(Math.floor(10 + Math.random() * 50));
    const currentServingNum = Number(hospital?.currentLiveToken || '1');
    const queueAhead = Math.max(1, Number(generatedTokenNum) - currentServingNum);

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
      const url = backend ? `${backend}/api/appointments` : '/api/appointments';

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalId,
          doctorId: selectedDoctor?.id || 'doc_1',
          appointmentDate: selectedDate,
          timeSlot: selectedTimeSlot,
          patientName,
          tokenNumber: generatedTokenNum,
        }),
      });
    } catch (err) {
      console.warn('Backend offline, using client session:', err);
    }

    const newAppointment = {
      id: `appt_${Date.now()}`,
      hospitalId,
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'IN_QUEUE',
      totalFee: selectedDoctor?.fee || 300,
      hospital: { name: hospital?.name, address: hospital?.address },
      department: { name: selectedDoctor?.specialization || 'General OPD' },
      token: {
        tokenNumber: generatedTokenNum,
        queuePosition: queueAhead,
        estimatedWaitMinutes: queueAhead * 5,
        status: 'IN_QUEUE',
      },
    };

    const existingRaw = localStorage.getItem('my_appointments');
    const existingList = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem('my_appointments', JSON.stringify([newAppointment, ...existingList]));

    setConfirmedToken({
      tokenNumber: generatedTokenNum,
      queuePosition: queueAhead,
      estimatedWait: `${queueAhead * 5} mins`,
      doctorName: selectedDoctor?.name || 'Duty Doctor',
      timeSlot: selectedTimeSlot,
    });

    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center text-xs text-slate-400">
        Loading hospital profile & live token status...
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <span className="text-4xl block">🏥</span>
        <h2 className="text-lg font-bold text-white">Hospital Not Found</h2>
        <p className="text-xs text-slate-400">This hospital is not registered in the system yet.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          ← Back to Hospital Directory
        </Link>
      </div>
    );
  }

  const currentLive = hospital.currentLiveToken || '1';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-20">
      {/* Token Confirmation Modal */}
      {confirmedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-3xl">
              🎉
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">
                OPD Token Confirmed
              </span>
              <h2 className="text-4xl font-mono font-black text-white tracking-wider">
                Token #{confirmedToken.tokenNumber}
              </h2>
              <p className="text-xs text-slate-400">
                {hospital.name} • {confirmedToken.doctorName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">CURRENTLY SERVING</span>
                <span className="font-bold text-teal-400 text-sm">Token #{currentLive}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ESTIMATED WAIT</span>
                <span className="font-bold text-sky-400 text-sm">{confirmedToken.estimatedWait}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px]">CONSULTATION SLOT</span>
                <span className="font-bold text-white text-xs">{selectedDate} ({confirmedToken.timeSlot})</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 transition-all"
            >
              Track Live Token Status in Dashboard ➔
            </button>
          </div>
        </div>
      )}

      {/* Hospital Official Banner with Live Token Badge */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                {hospital.isGovernment ? '🏛️ Govt Hospital' : '🏥 Private Hospital'}
              </span>
              {hospital.isEmergency && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  🚨 24/7 Emergency
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white">{hospital.name}</h1>
            <p className="text-xs text-slate-400">📍 {hospital.address}, {hospital.city}, Telangana</p>
          </div>

          {/* Live Ongoing Token Callout Box */}
          <div className="p-4 bg-teal-500/10 border-2 border-teal-500/40 rounded-2xl text-center space-y-1 sm:min-w-[200px]">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE IN DOCTOR ROOM
            </div>
            <div className="text-3xl font-mono font-black text-teal-300">
              Token #{currentLive}
            </div>
            <div className="text-[10px] text-slate-400">
              Updated live by receptionist
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Emergency Hotline</span>
            <span className="font-bold text-slate-200 font-mono">{hospital.contactNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">OPD Hours</span>
            <span className="font-bold text-slate-200">{hospital.openHours || '08:00 AM - 02:00 PM'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Consultation Fee</span>
            <span className="font-bold text-teal-400">{hospital.isGovernment ? 'FREE' : '₹500 / Token'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Reception Desk Status</span>
            <span className="font-bold text-emerald-400">● Live Reception Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Doctors List & Fast Token Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors List */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="text-lg font-black text-white">Select Doctor on Duty</h2>
            <p className="text-xs text-slate-400">Pick a specialist to generate your token number in this hospital's OPD queue.</p>
          </div>

          <div className="space-y-3">
            {(hospital.doctors || []).map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                  selectedDoctor?.id === doc.id
                    ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/5'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{doc.name}</h3>
                    {selectedDoctor?.id === doc.id && (
                      <span className="px-2 py-0.5 bg-teal-500 text-slate-950 text-[10px] font-black rounded-md">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-teal-400">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-400">{doc.qualification} • {doc.experience}</p>
                  <p className="text-[11px] text-slate-500">📍 {doc.roomNo} • ⏱️ {doc.availableTime}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-teal-400">
                    {doc.fee === 0 ? 'FREE' : `₹${doc.fee}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Booking Form */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-teal-500/30 shadow-2xl space-y-5 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">OPD Registration</span>
            <h2 className="text-base font-black text-white mt-0.5">Book Next Token</h2>
          </div>

          <form onSubmit={handleBookToken} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="30"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Time Slot *</label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM (Morning)</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Peak)</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM (Midday)</option>
                <option value="01:00 PM - 01:30 PM">01:00 PM - 01:30 PM (Afternoon)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-3.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {bookingLoading ? 'Issuing Token...' : '🎫 Issue OPD Token & Join Queue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
