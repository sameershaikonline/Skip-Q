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
  departments?: Array<{ id: string; name: string }>;
  doctors?: Doctor[];
}

const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. K. Sridhar MD (Gen Med)',
    specialization: 'General Physician & Diabetologist',
    qualification: 'MBBS, MD - Osmania Medical College',
    experience: '14+ Years Experience',
    roomNo: 'OPD Room 4 (Ground Floor)',
    fee: 500,
    availableTime: '09:00 AM - 01:30 PM',
  },
  {
    id: 'doc-2',
    name: 'Dr. P. Ramesh Babu MS (Ortho)',
    specialization: 'Senior Orthopedic Surgeon',
    qualification: 'MBBS, MS (Ortho), DNB',
    experience: '18+ Years Experience',
    roomNo: 'OPD Room 7 (1st Floor)',
    fee: 500,
    availableTime: '10:00 AM - 02:00 PM',
  },
  {
    id: 'doc-3',
    name: 'Dr. M. Anitha Reddy MD (Pediatrics)',
    specialization: 'Child Specialist & Neonatologist',
    qualification: 'MBBS, MD (Pediatrics)',
    experience: '10+ Years Experience',
    roomNo: 'OPD Room 2 (Ground Floor)',
    fee: 450,
    availableTime: '09:30 AM - 01:00 PM',
  },
  {
    id: 'doc-4',
    name: 'Dr. V. Madhavi Latha DGO',
    specialization: 'Consultant Gynecologist',
    qualification: 'MBBS, DGO - Gandhi Medical College',
    experience: '12+ Years Experience',
    roomNo: 'OPD Room 5 (1st Floor)',
    fee: 500,
    availableTime: '10:30 AM - 03:00 PM',
  },
];

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.id as string;

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(SAMPLE_DOCTORS[0]);
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

  useEffect(() => {
    // Preload user name if logged in
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) setPatientName(u.name);
      }
    } catch {}

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backend && hospitalId && !hospitalId.startsWith('hosp-')) {
      fetch(`${backend}/api/hospitals/${hospitalId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.name) {
            setHospital({
              ...data,
              doctors: data.doctors?.length ? data.doctors : SAMPLE_DOCTORS,
            });
            if (data.doctors?.length) setSelectedDoctor(data.doctors[0]);
          } else {
            loadFallback();
          }
        })
        .catch(loadFallback)
        .finally(() => setLoading(false));
    } else {
      loadFallback();
      setLoading(false);
    }
  }, [hospitalId]);

  const loadFallback = () => {
    let name = 'District Government Area Hospital';
    let address = 'Station Road, Beside Collectorate';
    if (hospitalId === 'hosp-2') {
      name = 'City Care Multispecialty Hospital';
      address = 'Main Bazar Road, Near Gandhi Center';
    } else if (hospitalId === 'hosp-3') {
      name = 'Sanjeevani Mother & Child Hospital';
      address = 'Bypass Road, Opp. RTC Bus Station';
    } else if (hospitalId === 'hosp-4') {
      name = 'Sri Krishna Orthopedic & Trauma Center';
      address = 'Nehru Center, Court Road';
    }

    setHospital({
      id: hospitalId || 'hosp-1',
      name,
      address,
      city: 'Mahabubabad',
      contactNumber: '+91 8719 252001',
      email: 'opd@hospital.com',
      rating: 4.8,
      openHours: '24/7 Emergency & Daily OPD (08:30 AM - 02:00 PM)',
      isEmergency: true,
      isGovernment: hospitalId === 'hosp-1',
      doctors: SAMPLE_DOCTORS,
      departments: [
        { id: 'd1', name: 'General Medicine' },
        { id: 'd2', name: 'Orthopedics' },
        { id: 'd3', name: 'Pediatrics' },
        { id: 'd4', name: 'Gynecology' },
      ],
    });
    setSelectedDoctor(SAMPLE_DOCTORS[0]);
  };

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

    const generatedTokenNum = `TK-${Math.floor(100 + Math.random() * 900)}`;
    const randomQueuePos = Math.floor(2 + Math.random() * 5);

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backend) {
        await fetch(`${backend}/api/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hospitalId,
            doctorId: selectedDoctor.id,
            appointmentDate: selectedDate,
            timeSlot: selectedTimeSlot,
            patientName,
          }),
        });
      }
    } catch (err) {
      console.warn('Backend offline, using client-side generated token session:', err);
    }

    // Save active token locally for instant dashboard queue tracking
    const newAppointment = {
      id: `appt_${Date.now()}`,
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot,
      status: 'IN_QUEUE',
      totalFee: selectedDoctor.fee,
      hospital: { name: hospital?.name, address: hospital?.address },
      department: { name: selectedDoctor.specialization },
      token: {
        tokenNumber: generatedTokenNum,
        queuePosition: randomQueuePos,
        estimatedWaitMinutes: randomQueuePos * 4,
        status: 'IN_QUEUE',
      },
    };

    const existingRaw = localStorage.getItem('my_appointments');
    const existingList = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem('my_appointments', JSON.stringify([newAppointment, ...existingList]));

    setConfirmedToken({
      tokenNumber: generatedTokenNum,
      queuePosition: randomQueuePos,
      estimatedWait: `${randomQueuePos * 4} mins`,
      doctorName: selectedDoctor.name,
      timeSlot: selectedTimeSlot,
    });

    setBookingLoading(false);
  };

  if (loading || !hospital) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center text-xs text-slate-400">
        Loading hospital details & OPD schedule...
      </div>
    );
  }

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
                {confirmedToken.tokenNumber}
              </h2>
              <p className="text-xs text-slate-400">
                {hospital.name} • {confirmedToken.doctorName}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">CURRENT QUEUE</span>
                <span className="font-bold text-amber-400 text-sm">#{confirmedToken.queuePosition} in line</span>
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

      {/* Hospital Official Banner */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                {hospital.isGovernment ? '🏛️ Government Hospital' : '🏥 Verified Multispecialty'}
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

          <div className="text-right">
            <span className="inline-block text-sm font-bold text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/20">
              ★ {hospital.rating || 4.8} / 5.0
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Emergency Hotline</span>
            <span className="font-bold text-slate-200 font-mono">{hospital.contactNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">OPD Hours</span>
            <span className="font-bold text-slate-200">{hospital.openHours || '09:00 AM - 02:00 PM'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Consultation Fee</span>
            <span className="font-bold text-teal-400">{hospital.isGovernment ? 'FREE' : '₹500 / Token'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Live Token Counter</span>
            <span className="font-bold text-emerald-400">● Counter Open</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Doctor Selection & Token Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors on Duty */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h2 className="text-lg font-black text-white">Select OPD Specialist Doctor</h2>
            <p className="text-xs text-slate-400">Choose a specialist to generate your token counter number.</p>
          </div>

          <div className="space-y-3">
            {(hospital.doctors || SAMPLE_DOCTORS).map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                  selectedDoctor.id === doc.id
                    ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-500/5'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{doc.name}</h3>
                    {selectedDoctor.id === doc.id && (
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

        {/* Right 1 Col: Token Booking Form */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-teal-500/30 shadow-2xl space-y-5 h-fit">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Fast Token Desk</span>
            <h2 className="text-base font-black text-white mt-0.5">Book Digital OPD Token</h2>
          </div>

          <form onSubmit={handleBookToken} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sameer"
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
                  placeholder="24"
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
              <label className="block font-semibold text-slate-300 mb-1">Time Window *</label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM (Morning Slot)</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM (Peak Slot)</option>
                <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM (Midday Slot)</option>
                <option value="01:00 PM - 01:30 PM">01:00 PM - 01:30 PM (Afternoon Slot)</option>
              </select>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Doctor Consultation</span>
                <span>{selectedDoctor.fee === 0 ? 'FREE' : `₹${selectedDoctor.fee}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Digital Token Fee</span>
                <span className="text-teal-400">₹0 (Free)</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-teal-400">{selectedDoctor.fee === 0 ? 'FREE' : `₹${selectedDoctor.fee}`}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full py-3.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 active:scale-95 transition-all disabled:opacity-50"
            >
              {bookingLoading ? 'Issuing Digital Token...' : '🎫 Issue OPD Token & Join Queue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
