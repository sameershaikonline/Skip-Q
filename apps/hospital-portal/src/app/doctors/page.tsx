'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, ArrowLeft } from 'lucide-react';

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
      if (!res.ok) throw new Error(data.message || 'Failed to onboard physician');

      setFormSuccess(`Dr. ${name} registered to your OPD roster!`);
      setName('');
      setEmail('');
      fetchDoctors();
    } catch (err: any) {
      setFormError(err.message || 'Error saving doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Doctors & OPD Schedule</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage physicians on duty for patient appointments</p>
        </div>

        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          ← Return to Live Caller
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Doctors Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Attending Physicians ({doctors.length})</h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="loader-ring"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retrieving Doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 text-center py-6">No individual doctors registered.</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 rounded-[2rem] glass border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{doc.user?.name || 'Physician'}</h3>
                        <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        {doc.specialization} • {doc.qualification || 'MBBS'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Room: {doc.roomNo || 'Room 1'} • Email: {doc.user?.email}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] font-bold text-slate-400 block">Fee</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">₹{doc.fee || 300}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Add Doctor Form */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Add Physician</h3>

            {formSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-2xl">
                {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold rounded-2xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Satya Sri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="General Physician / Cardiology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Doctor Email</label>
                <input
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Add Doctor to Schedule ➔'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
