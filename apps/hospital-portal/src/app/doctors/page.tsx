'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Stethoscope, UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
      if (!res.ok) throw new Error(data.message || 'Failed to register doctor');

      setFormSuccess(`Dr. ${name} successfully added to hospital outpatient roster.`);
      setName('');
      setEmail('');
      fetchDoctors();
    } catch (err: any) {
      setFormError(err.message || 'Error saving doctor details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Hospital Medical Staff</h1>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200">
              Staff Management
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage practicing specialists and outpatient consultation parameters
          </p>
        </div>

        <Link
          href="/"
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Live Calling Desk</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Doctors Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Attending Physicians</h2>
                <p className="text-xs text-slate-500">Doctors currently listed on the public patient token portal</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {doctors.length} Registered
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Retrieving roster...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No individual doctors registered. Add a practitioner using the form.
              </div>
            ) : (
              <div className="space-y-2.5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        <h3 className="text-xs font-semibold text-slate-900">{doc.user?.name || 'Physician'}</h3>
                        <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {doc.specialization} • {doc.qualification || 'MBBS'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Room: {doc.roomNo || 'Room 1'} • Email: {doc.user?.email}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">Fee</span>
                      <span className="text-xs font-semibold text-slate-900">₹{doc.fee || 300}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Add Doctor Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-900">Add Practitioner</h3>
              <p className="text-xs text-slate-500">Register doctor to facility schedule</p>
            </div>

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {formSuccess}
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Satya Sri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Medical Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="General Medicine / Cardiology"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="300"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Register Practitioner'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
