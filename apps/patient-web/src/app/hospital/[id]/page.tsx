'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  Calendar,
  User,
  ArrowLeft,
  Activity,
  AlertCircle
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
    }, 800);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-32 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Connecting to facility...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto my-32 p-8 bg-white border border-slate-200 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
        <h2 className="text-sm font-semibold text-slate-900">Hospital Not Found</h2>
        <p className="text-xs text-slate-500">The facility is inactive or undergoing verification.</p>
        <Link href="/" className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg inline-block">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-teal-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hospitals</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{hospital.name}</span>
      </div>

      {/* Facility Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
                {hospital.isGovernment ? 'Government Institution' : 'Private Facility'}
              </span>
              {hospital.isEmergency && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-semibold rounded border border-rose-200">
                  24/7 Emergency
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{hospital.name}</h1>
              <ShieldCheck className="w-5 h-5 text-teal-700" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospital.address}, {hospital.city}</span>
              <span className="mx-1">•</span>
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospital.contactNumber}</span>
            </p>
          </div>

          {/* Live Token Indicator */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-4 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Ongoing Token in Room
              </span>
              <div className="text-2xl font-mono font-bold text-slate-900">
                #{hospital.currentLiveToken || '1'}
              </div>
              <span className="text-[10px] text-slate-500">Live Counter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Doctors & Token Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Doctors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
              Available Practitioners
            </h2>

            {(!hospital.doctors || hospital.doctors.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-500">
                General Duty Physician is currently attending OPD.
              </div>
            ) : (
              <div className="space-y-2.5">
                {hospital.doctors.map((doc) => {
                  const docName = doc.user?.name || doc.name || 'Practitioner';
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-700" />
                          <h3 className="text-xs font-semibold text-slate-900">{docName}</h3>
                          {isSelected && (
                            <span className="text-[10px] font-medium bg-teal-700 text-white px-2 py-0.2 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {doc.specialization} • {doc.qualification || 'MBBS'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Room: {doc.roomNo || 'Room 1'} • Schedule: {doc.availableTime || '09:00 AM - 02:00 PM'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                        <span className="text-xs font-semibold text-slate-900">₹{doc.fee || 300}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="space-y-4">
          {confirmedToken ? (
            <div className="bg-white rounded-xl border border-teal-700 p-5 space-y-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-teal-700 mx-auto" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-teal-800 tracking-wider">
                  Registration Successful
                </span>
                <h3 className="text-base font-bold text-slate-900">Digital Outpatient Token</h3>
              </div>

              <div className="p-4 bg-slate-900 rounded-lg text-white space-y-1">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Token Number
                </span>
                <div className="text-4xl font-mono font-bold text-teal-400">
                  #{confirmedToken.tokenNumber}
                </div>
                <span className="text-xs text-slate-300 block pt-1">
                  Est. Wait: ~{confirmedToken.estimatedWait}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 text-left p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p><span className="text-slate-400">Doctor:</span> {confirmedToken.doctorName}</p>
                <p><span className="text-slate-400">Slot:</span> {confirmedToken.timeSlot}</p>
                <p><span className="text-slate-400">Patient:</span> {patientName}</p>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg block transition-colors"
              >
                Track Live Queue Position
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-semibold text-slate-900">Issue Outpatient Token</h3>
                <p className="text-xs text-slate-500">Provide patient details for queue registration</p>
              </div>

              <form onSubmit={handleBookToken} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 32"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Preferred Time Window</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white"
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
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Token...</span>
                    </>
                  ) : (
                    'Confirm Token Registration'
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
