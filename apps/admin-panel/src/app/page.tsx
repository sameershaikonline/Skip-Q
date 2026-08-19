'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Trash2,
  Stethoscope
} from 'lucide-react';

interface DoctorInput {
  name: string;
  designation: string;
  imageUrl: string;
  description: string;
  fee: string;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  password?: string;
  licenseNumber: string;
  isEmergency?: boolean;
  isGovernment?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  currentLiveToken?: string;
  doctors?: Array<{ id: string; specialization: string; user?: { name: string; avatarUrl?: string } }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'HOSPITALS' | 'MANUAL_ADD'>('HOSPITALS');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Hospital Form State
  const [newHospital, setNewHospital] = useState({
    name: '',
    address: '',
    city: 'Mahabubabad',
    contactNumber: '',
    email: '',
    password: '',
    licenseNumber: '',
    isGovernment: false,
    isEmergency: true,
  });

  // Dynamic Doctors List in Onboarding
  const [doctorsList, setDoctorsList] = useState<DoctorInput[]>([
    { name: '', designation: 'General Physician', imageUrl: '', description: '', fee: '300' },
  ]);

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = () => {
    setLoading(true);
    fetch('/api/hospitals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHospitals(data);
        else setHospitals([]);
      })
      .catch(() => setHospitals([]))
      .finally(() => {
        setLoading(false);
        setAuthChecking(false);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchHospitals();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    router.push('/auth/login');
  };

  const handleAddDoctorField = () => {
    setDoctorsList([
      ...doctorsList,
      { name: '', designation: 'Specialist', imageUrl: '', description: '', fee: '300' },
    ]);
  };

  const handleRemoveDoctorField = (index: number) => {
    if (doctorsList.length === 1) return;
    setDoctorsList(doctorsList.filter((_, i) => i !== index));
  };

  const handleDoctorChange = (index: number, field: keyof DoctorInput, value: string) => {
    const updated = [...doctorsList];
    updated[index][field] = value;
    setDoctorsList(updated);
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...newHospital,
        doctors: doctorsList.filter((d) => d.name.trim().length > 0),
      };

      const res = await fetch('/api/admin/onboard-hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to onboard facility');
      }

      setFormSuccess(`🎉 Facility "${newHospital.name}" successfully created in database! Credentials emailed.`);
      setNewHospital({
        name: '',
        address: '',
        city: 'Mahabubabad',
        contactNumber: '',
        email: '',
        password: '',
        licenseNumber: '',
        isGovernment: false,
        isEmergency: true,
      });
      setDoctorsList([
        { name: '', designation: 'General Physician', imageUrl: '', description: '', fee: '300' },
      ]);
      fetchHospitals();
      setTimeout(() => setActiveTab('HOSPITALS'), 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to onboard facility');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      await fetch(`/api/admin/hospitals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchHospitals();
    } catch {}
  };

  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="loader-ring"></div>
        <p className="font-black animate-pulse text-slate-500 uppercase tracking-widest text-xs">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="glass p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Skip-Q <span className="gradient-text">Governance</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Super Admin facility onboarding & queue supervision
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 glass rounded-2xl">
            <button
              onClick={() => setActiveTab('HOSPITALS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'HOSPITALS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Facilities ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('MANUAL_ADD')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'MANUAL_ADD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              + Onboard Facility
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-500/10 text-rose-500 font-bold text-xs rounded-2xl hover:bg-rose-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] shadow-xl space-y-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Registered Facilities</span>
          <div className="text-4xl font-black text-slate-900 dark:text-white">{hospitals.length}</div>
          <p className="text-xs font-bold text-blue-500">● Live in Supabase</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] shadow-xl space-y-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Region</span>
          <div className="text-4xl font-black text-slate-900 dark:text-white">Mahabubabad</div>
          <p className="text-xs font-medium text-slate-500">District Center</p>
        </div>

        <div className="glass p-8 rounded-[2.5rem] shadow-xl space-y-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Database Sync</span>
          <div className="text-4xl font-black text-emerald-500">Active</div>
          <p className="text-xs font-medium text-slate-500">Auto-refresh 4s</p>
        </div>
      </div>

      {/* TAB 1: Hospitals Directory */}
      {activeTab === 'HOSPITALS' && (
        <div className="glass p-8 rounded-[3rem] shadow-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Participating Hospitals</h2>
            <button
              onClick={fetchHospitals}
              className="px-4 py-2 glass rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:scale-105 transition-transform"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <div className="loader-ring"></div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading facilities...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-4">
              <p className="font-bold text-base text-slate-700 dark:text-slate-300">Clean slate: Zero hospitals registered in the database yet.</p>
              <p className="text-xs text-slate-400">Click "+ Onboard Facility" above to add your first verified hospital with doctors.</p>
              <button
                onClick={() => setActiveTab('MANUAL_ADD')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
              >
                + Onboard First Hospital Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead className="text-slate-400 uppercase font-black text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Facility Name</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Login Email</th>
                    <th className="p-3">Live Token</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {hospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-100/40 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div>{hosp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Lic: {hosp.licenseNumber}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <div>{hosp.address}</div>
                        <div className="text-[11px] font-bold text-blue-500">{hosp.city}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{hosp.email}</td>
                      <td className="p-3 font-mono font-black text-blue-500 text-sm">
                        #{hosp.currentLiveToken || '1'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            hosp.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {hosp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {hosp.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'SUSPENDED')}
                            className="px-4 py-2 glass text-amber-600 font-bold rounded-xl text-xs hover:scale-105 transition-transform"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'APPROVED')}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Onboard Form with Doctors */}
      {activeTab === 'MANUAL_ADD' && (
        <div className="glass p-8 md:p-10 rounded-[3rem] shadow-2xl space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Onboard Healthcare Facility</h2>
            <p className="text-xs font-medium text-slate-500">Creates database record, adds doctors, and emails reception login credentials</p>
          </div>

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

          <form onSubmit={handleCreateHospital} className="space-y-6 text-xs font-bold">
            {/* Hospital Details */}
            <div className="space-y-4">
              <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest block">
                🏥 Facility Information
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Facility Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo / SatyaSri Hospital"
                    value={newHospital.name}
                    onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mahabubabad"
                    value={newHospital.city}
                    onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Address / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="Main Road, Mahabubabad"
                  value={newHospital.address}
                  onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Reception Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={newHospital.contactNumber}
                    onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Registration License</label>
                  <input
                    type="text"
                    placeholder="TS-MBD-001"
                    value={newHospital.licenseNumber}
                    onChange={(e) => setNewHospital({ ...newHospital, licenseNumber: e.target.value })}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Reception Credentials */}
            <div className="p-5 glass rounded-2xl space-y-3">
              <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest block">
                🔑 RECEPTION LOGIN CREDENTIALS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Authorized Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="reception@hospital.com"
                    value={newHospital.email}
                    onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Assigned Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newHospital.password}
                    onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* DYNAMIC DOCTORS ONBOARDING SECTION */}
            <div className="p-6 glass rounded-[2.5rem] space-y-5 border-2 border-blue-500/20">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest block">
                    👨‍⚕️ ATTENDING DOCTORS & SPECIALISTS (OPTIONAL)
                  </span>
                  <p className="text-[11px] text-slate-500 font-normal">Add doctor names, designations, photos, and descriptions for this hospital</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDoctorField}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition-all hover:scale-105"
                >
                  + Add Doctor
                </button>
              </div>

              <div className="space-y-4">
                {doctorsList.map((doc, idx) => (
                  <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">Doctor #{idx + 1}</span>
                      {doctorsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoctorField(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. Rajesh Kumar MD"
                          value={doc.name}
                          onChange={(e) => handleDoctorChange(idx, 'name', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Designation / Specialty</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Cardiologist / Pediatrician"
                          value={doc.designation}
                          onChange={(e) => handleDoctorChange(idx, 'designation', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Photo Image URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="https://example.com/doctor-photo.jpg"
                          value={doc.imageUrl}
                          onChange={(e) => handleDoctorChange(idx, 'imageUrl', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Consultation Fee (₹)</label>
                        <input
                          type="number"
                          placeholder="300"
                          value={doc.fee}
                          onChange={(e) => handleDoctorChange(idx, 'fee', e.target.value)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Description / Bio (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 12+ years experience in cardiac diagnostics and preventive care."
                        value={doc.description}
                        onChange={(e) => handleDoctorChange(idx, 'description', e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Onboarding Facility & Adding Doctors...</span>
                </>
              ) : (
                'Onboard Facility & Deploy to Live Network ➔'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
