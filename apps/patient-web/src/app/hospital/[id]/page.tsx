'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface Doctor {
  id: string;
  name?: string;
  specialization: string;
  qualification?: string;
  experience?: number | string;
  roomNo?: string;
  fee?: number;
  availableTime?: string;
  user?: { name: string; email: string; phone?: string };
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
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [confirmedToken, setConfirmedToken] = useState<{
    tokenNumber: string;
    queuePosition: number;
    estimatedWait: string;
    doctorName: string;
    timeSlot: string;
  } | null>(null);

  const fetchHospitalDetails = () => {
    if (!hospitalId) return;
    fetch(`/api/hospitals/${hospitalId}`)
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
        }
      })
      .catch(() => setHospital(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.name) setPatientName(u.name);
        if (u.phone) setPatientPhone(u.phone);
      }
    } catch {}

    fetchHospitalDetails();
    const interval = setInterval(fetchHospitalDetails, 4000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  const createConfetti = () => {
    for (let i = 0; i < 30; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.backgroundColor = ['#fff', '#fbd38d', '#90cdf4', '#fbb6ce', '#60a5fa'][Math.floor(Math.random() * 5)];
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3000);
    }
  };

  const handleBookToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    const currentNum = Number(hospital?.currentLiveToken) || 1;
    const assignedTokenNum = String(currentNum + Math.floor(Math.random() * 3) + 1);
    const estMinutes = 15;

    const tokenObj = {
      tokenNumber: assignedTokenNum,
      queuePosition: Math.max(1, Number(assignedTokenNum) - currentNum),
      estimatedWait: `${estMinutes} Mins`,
      doctorName: selectedDoctor?.user?.name || selectedDoctor?.name || 'General OPD Specialist',
      timeSlot: selectedTimeSlot,
      hospitalName: hospital?.name || 'Hospital',
      hospitalId: hospital?.id,
      patientName: patientName || 'Patient',
      appointmentDate: selectedDate,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('my_appointments') || '[]');
      existing.unshift({
        id: `apt_${Date.now()}`,
        appointmentDate: selectedDate,
        timeSlot: selectedTimeSlot,
        status: 'CONFIRMED',
        hospitalName: hospital?.name,
        doctor: { name: tokenObj.doctorName },
        token: {
          tokenNumber: assignedTokenNum,
          queuePosition: tokenObj.queuePosition,
          estimatedWaitMinutes: estMinutes,
          status: 'IN_QUEUE',
        },
      });
      localStorage.setItem('my_appointments', JSON.stringify(existing));
    } catch {}

    setTimeout(() => {
      setBookingLoading(false);
      setConfirmedToken(tokenObj);
      setShowAnimation(true);
      createConfetti();
      setTimeout(() => setShowAnimation(false), 2200);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="loader-ring"></div>
        <p className="font-black animate-pulse text-slate-500 uppercase tracking-widest text-xs">
          Loading Facility Queue...
        </p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto my-32 p-10 glass rounded-[3rem] text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Facility Not Found</h2>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/30 inline-block">
          Return to Clinics
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Fullscreen Animation Overlay (CyberVerify Style) */}
      {showAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl bg-blue-600/90 transition-all duration-500 animate-in fade-in">
          <div className="text-center p-8 text-white space-y-4 animate-bounce-subtle">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
              Token #{confirmedToken?.tokenNumber}
            </h2>
            <p className="text-xl font-bold opacity-90">Digital OPD Appointment Confirmed!</p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Hospitals</span>
      </Link>

      {/* Hero Card */}
      <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black">
              Verified Medical Partner
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {hospital.name}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{hospital.address}, {hospital.city}</span>
              <span>•</span>
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{hospital.contactNumber}</span>
            </p>
          </div>

          {/* Live In-Room Box */}
          <div className="p-6 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-blue-500/20 text-center space-y-1 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">
              NOW IN DOCTOR ROOM
            </span>
            <div className="text-4xl font-mono font-black">
              #{hospital.currentLiveToken || '1'}
            </div>
            <span className="text-[10px] text-blue-200 font-bold block">● Live Counter</span>
          </div>
        </div>
      </div>

      {/* 2-Col Grid: Doctors & Instant Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Doctors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[3rem] shadow-xl space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Available Doctors
            </h2>

            {(!hospital.doctors || hospital.doctors.length === 0) ? (
              <p className="text-sm text-slate-500">General OPD Physician is on duty.</p>
            ) : (
              <div className="space-y-3">
                {hospital.doctors.map((doc) => {
                  const docName = doc.user?.name || doc.name || 'Practitioner';
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-xl'
                          : 'border-slate-200 dark:border-slate-800 glass hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-blue-500" />
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">{docName}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                          {doc.specialization} • {doc.qualification || 'MBBS'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[11px] font-bold text-slate-400 block">Fee</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">₹{doc.fee || 300}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form or Result Card */}
        <div className="space-y-6">
          {confirmedToken ? (
            <div className="glass p-8 rounded-[3rem] shadow-2xl text-center space-y-6 border-2 border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">Digital Token</h3>

              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white space-y-1 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">
                  ASSIGNED TOKEN NUMBER
                </span>
                <div className="text-6xl font-mono font-black">
                  #{confirmedToken.tokenNumber}
                </div>
                <span className="text-xs text-blue-200 font-bold block pt-1">
                  Est. Wait: ~{confirmedToken.estimatedWait}
                </span>
              </div>

              <Link
                href="/dashboard"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all block hover:scale-105"
              >
                Track in Live Queue ➔
              </Link>
            </div>
          ) : (
            <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-5">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Book OPD Token</h3>
                <p className="text-xs font-medium text-slate-500">Generate instant digital entry token</p>
              </div>

              <form onSubmit={handleBookToken} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 28"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 transition-all"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Digital Token...</span>
                    </>
                  ) : (
                    'Confirm & Generate Token ➔'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
