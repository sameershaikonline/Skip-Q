'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DoctorItem {
  id: string;
  specialization: string;
  qualification: string;
  experience: number;
  fee: number;
  roomNo?: string;
  user?: { name: string; email: string; phone?: string };
  department?: { name: string };
}

export default function ManageDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [fee, setFee] = useState('300');
  const [departmentName, setDepartmentName] = useState('General OPD');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDoctors = () => {
    const token = localStorage.getItem('hospital_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    fetch('/api/hospitals/my-doctors', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
        else setDoctors([]);
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    setFormSuccess('');

    const token = localStorage.getItem('hospital_token');
    const hospitalId = localStorage.getItem('hospital_id');

    try {
      const res = await fetch('/api/hospitals/my-doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          specialization,
          qualification,
          fee: Number(fee) || 300,
          departmentName,
          hospitalId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to onboard doctor');

      setFormSuccess(`🎉 Dr. ${name} successfully onboarded and added to your OPD schedule!`);
      setName('');
      setEmail('');
      fetchDoctors();
    } catch (err: any) {
      setFormError(err.message || 'Error adding doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Hospital Doctors & OPD Management</h1>
            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">
              Staff Portal
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage your on-duty specialists and OPD consultation fees visible to patients.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          ← Back to Live Queue Caller
        </Link>
      </div>

      {/* 2-Column Layout: Doctors List & Onboard Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">On-Duty Doctors List</h2>
                <p className="text-xs text-slate-500">Doctors available for patient OPD token generation</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {doctors.length} Doctors Active
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Fetching active doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No doctors registered yet.</p>
                <p className="text-slate-400">Add your first specialist doctor using the form on the right.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👨‍⚕️</span>
                        <h3 className="text-sm font-bold text-slate-900">{doc.user?.name || 'Doctor'}</h3>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {doc.specialization} • {doc.qualification || 'MBBS'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        OPD Room: {doc.roomNo || 'Room 1'} • Email: {doc.user?.email}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Consultation Fee</span>
                      <span className="text-sm font-bold text-slate-900">₹{doc.fee || 300}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Add Doctor Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Onboard New Doctor</h3>
              <p className="text-xs text-slate-500">Add a physician to your clinic profile</p>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Satya Sri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="General Physician / Cardiologist"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    placeholder="MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Doctor Email</label>
                <input
                  type="email"
                  placeholder="doctor@skipq.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Doctor...</span>
                  </>
                ) : (
                  'Add Doctor to OPD Schedule ➔'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
