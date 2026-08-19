'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const handleBookToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    // Calculate next token #
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

    // Save to user's local booked appointments
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
    }, 1000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Connecting to hospital live queue...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto my-32 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <span className="text-4xl block">🏥</span>
        <h2 className="text-lg font-bold text-slate-900">Hospital Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested clinic is either suspended or pending approval.</p>
        <Link href="/" className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow inline-block">
          ← Return to Hospitals Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/" className="hover:text-emerald-600">Hospitals Directory</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{hospital.name}</span>
      </div>

      {/* Hospital Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                Verified Medical Partner
              </span>
              {hospital.isEmergency && (
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                  🚨 24/7 Emergency
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{hospital.name}</h1>
            <p className="text-xs text-slate-500">
              📍 {hospital.address}, {hospital.city} • 📞 {hospital.contactNumber}
            </p>
          </div>

          {/* REAL-TIME LIVE TOKEN BEACON */}
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-5 shrink-0 shadow-sm">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600"></span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-900 tracking-wider block">
                NOW IN DOCTOR ROOM
              </span>
              <div className="text-3xl font-mono font-black text-emerald-700">
                Token #{hospital.currentLiveToken || '1'}
              </div>
              <span className="text-[10px] font-semibold text-emerald-800">● Live Reception Broadcast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Doctors & Instant OPD Token Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Available Doctors & OPD Specialists
            </h2>

            {(!hospital.doctors || hospital.doctors.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <p>General OPD Doctor is on duty today.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hospital.doctors.map((doc) => {
                  const docName = doc.user?.name || doc.name || 'Specialist Doctor';
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👨‍⚕️</span>
                          <h3 className="text-sm font-bold text-slate-900">{docName}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {doc.specialization} • {doc.qualification || 'MBBS, MD'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Room: {doc.roomNo || 'OPD Room 1'} • Hours: {doc.availableTime || '09:00 AM - 02:00 PM'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs text-slate-400 block">OPD Consultation</span>
                        <span className="text-sm font-bold text-slate-900">₹{doc.fee || 300}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Instant Booking Form / Confirmed Token */}
        <div className="space-y-6">
          {confirmedToken ? (
            <div className="bg-white rounded-3xl border-2 border-emerald-600 p-6 shadow-md space-y-5 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  BOOKING CONFIRMED
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Your Digital OPD Token</h3>
              </div>

              <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  ASSIGNED TOKEN NUMBER
                </span>
                <div className="text-5xl font-mono font-black text-emerald-400">
                  #{confirmedToken.tokenNumber}
                </div>
                <span className="text-xs text-slate-300 block pt-1">
                  Est. Wait: ~{confirmedToken.estimatedWait}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5 text-left p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p><strong>Doctor:</strong> {confirmedToken.doctorName}</p>
                <p><strong>Time Slot:</strong> {confirmedToken.timeSlot}</p>
                <p><strong>Patient:</strong> {patientName}</p>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow block transition-colors"
              >
                Go to Live Queue Tracker ➔
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Book OPD Token</h3>
                <p className="text-xs text-slate-500">Get an instant digital token for today</p>
              </div>

              <form onSubmit={handleBookToken} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 28"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Time Slot</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option>09:30 AM - 10:00 AM</option>
                    <option>10:00 AM - 10:30 AM</option>
                    <option>10:30 AM - 11:00 AM</option>
                    <option>11:00 AM - 11:30 AM</option>
                    <option>12:00 PM - 12:30 PM</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating OPD Token...</span>
                    </>
                  ) : (
                    'Confirm & Generate OPD Token ➔'
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
