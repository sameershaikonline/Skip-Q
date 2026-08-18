'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
  departments?: Array<{ id: string; name: string }>;
  doctors?: Array<{ id: string; specialization: string; fee: number; user?: { name: string } }>;
}

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params?.id as string;

  const [hospital, setHospital] = useState<HospitalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [appointmentDate, setAppointmentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    if (!hospitalId) return;

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backend}/api/hospitals/${hospitalId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hospital not found');
        return res.json();
      })
      .then((data) => setHospital(data))
      .catch((err) => setError(err.message || 'Hospital details unavailable'))
      .finally(() => setLoading(false));
  }, [hospitalId]);

  const handleBookToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please sign in to book your OPD queue token.');
      router.push('/auth/login');
      return;
    }

    setBookingLoading(true);
    setBookingSuccess('');

    const departmentId = hospital?.departments?.[0]?.id || `dept-gen-${Date.now()}`;
    const doctorId = hospital?.doctors?.[0]?.id || `doc-gen-${Date.now()}`;

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backend}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hospitalId,
          departmentId,
          doctorId,
          appointmentDate,
          timeSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book OPD queue token.');
      }

      setBookingSuccess(`Token Booked Successfully! Token Number: ${data.token?.tokenNumber || 'TK-101'}`);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-xs text-slate-400">
        Loading hospital details...
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <span className="text-4xl block">🏥</span>
        <h2 className="text-lg font-bold text-white">Hospital Not Found</h2>
        <p className="text-xs text-slate-400">The requested hospital is not listed in Mahabubabad serve zone.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-teal-400 text-slate-950 font-bold text-xs rounded-xl"
        >
          Back to Hospitals Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
              Verified Partner Hospital • Mahabubabad
            </span>
            <h1 className="text-3xl font-black text-white mt-2">{hospital.name}</h1>
            <p className="text-xs text-slate-400 mt-1">📍 {hospital.address}, {hospital.city}</p>
          </div>
          <span className="text-sm font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            ★ {hospital.rating || 4.8}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Contact Phone</span>
            <span className="font-bold text-slate-200">{hospital.contactNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block">OPD Hours</span>
            <span className="font-bold text-slate-200">{hospital.openHours || '24/7'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Token OPD Fee</span>
            <span className="font-bold text-teal-400">₹500 / Token</span>
          </div>
        </div>
      </div>

      {/* Token Booking Card */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-teal-500/30 shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-black text-white">Generate OPD Consultation Queue Token</h2>
          <p className="text-xs text-slate-400 mt-1">Select your preferred date & time slot to receive your live digital token.</p>
        </div>

        {bookingSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold text-center">
            {bookingSuccess}
          </div>
        )}

        <form onSubmit={handleBookToken} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred OPD Time Slot *</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full py-3.5 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-teal-300 transition-colors disabled:opacity-50"
          >
            {bookingLoading ? 'Generating OPD Token...' : '🎫 Generate OPD Queue Token & Proceed'}
          </button>
        </form>
      </div>
    </div>
  );
}
