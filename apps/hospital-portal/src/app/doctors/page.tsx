'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DoctorItem {
  id: string;
  specialization: string;
  qualification: string;
  experience: number;
  fee: number;
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
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [fee, setFee] = useState('500');
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
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = backend ? `${backend}/api/hospitals/my-doctors` : '/api/hospitals/my-doctors';
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/auth/login');
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDoctors(data);
        else setDoctors([]);
      })
      .catch(() => {
        const raw = localStorage.getItem('hospital_doctors');
        if (raw) {
          try { setDoctors(JSON.parse(raw)); } catch {}
        } else {
          setDoctors([]);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('hospital_token');
    if (!token) return;

    setSaving(true);
    setFormSuccess('');
    setFormError('');

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
      const url = backend ? `${backend}/api/hospitals/doctors` : '/api/hospitals/doctors';
      const res = await fetch(url, {
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
          fee: Number(fee),
          departmentName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to add doctor');
      }

      setFormSuccess(`Doctor Dr. ${name} added successfully to ${departmentName}!`);
      setName('');
      setEmail('');
      setSpecialization('');
      setQualification('');

      fetchDoctors();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">OPD Doctor & Department Management</h1>
        <p className="text-slate-400 text-xs mt-1">Onboard doctors and OPD consultation departments for your hospital in Mahabubabad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-indigo-500/30 space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white">➕ Add OPD Doctor</h2>
            <p className="text-xs text-slate-400">Onboard a specialist doctor to handle patient OPD token appointments.</p>
          </div>

          {formSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold text-center">
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-bold text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Name *</label>
              <input
                type="text"
                required
                placeholder="Dr. Rajesh Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Doctor Email *</label>
              <input
                type="email"
                required
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="Cardiology / General"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OPD Department *</label>
                <input
                  type="text"
                  required
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Qualification *</label>
                <input
                  type="text"
                  required
                  placeholder="MBBS, MD"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OPD Fee (₹) *</label>
                <input
                  type="number"
                  required
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-indigo-400 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding Doctor...' : '➕ Add Doctor to Hospital OPD'}
            </button>
          </form>
        </div>

        {/* Doctors Directory List */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Active OPD Doctors ({doctors.length})</h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
              Loading doctors directory...
            </div>
          ) : doctors.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-3xl block">👨‍⚕️</span>
              <p className="font-bold text-white text-sm">No Doctors Onboarded Yet</p>
              <p className="text-slate-500">Use the form on the left to add your first OPD doctor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
                      {doc.department?.name || 'General OPD'}
                    </span>
                    <span className="text-xs font-bold text-teal-400">₹{doc.fee} / Token</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{doc.user?.name || 'Doctor'}</h3>
                  <p className="text-xs text-slate-300 font-semibold">{doc.specialization} ({doc.qualification})</p>
                  <p className="text-[11px] text-slate-500">Email: {doc.user?.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
