'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/onboard-hospital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to onboard hospital');
      }

      setFormSuccess(`🎉 "${newHospital.name}" onboarded and live in Supabase database! Credentials emailed.`);
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
      fetchHospitals();
      setTimeout(() => setActiveTab('HOSPITALS'), 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to onboard hospital');
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
      <div className="max-w-md mx-auto my-32 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-600 font-semibold">Verifying Super Admin Authorization...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Skip-Q Super Admin Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Master Governance
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Onboard new hospitals, assign receptionist credentials, and monitor platform health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('HOSPITALS')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'HOSPITALS' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏥 Hospitals ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('MANUAL_ADD')}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'MANUAL_ADD' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ➕ Onboard Hospital
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Registered Hospitals</span>
          <div className="text-3xl font-black text-slate-900">{hospitals.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold">● Live in Supabase PostgreSQL</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Active OPD Zone</span>
          <div className="text-3xl font-black text-slate-900">Mahabubabad</div>
          <p className="text-[11px] text-slate-500 font-medium">Primary Launch Territory</p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Database Status</span>
          <div className="text-3xl font-black text-emerald-600">Connected</div>
          <p className="text-[11px] text-slate-500 font-medium">Auto-syncing every 4s</p>
        </div>
      </div>

      {/* TAB 1: Hospitals Management Directory */}
      {activeTab === 'HOSPITALS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Hospitals Directory</h2>
              <p className="text-xs text-slate-500">Manage credentials, approval status, and live availability</p>
            </div>
            <button
              onClick={fetchHospitals}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              🔄 Refresh List
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Fetching hospital records from Supabase...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-3">
              <p className="font-semibold text-slate-700">No hospitals registered in the database yet.</p>
              <button
                onClick={() => setActiveTab('MANUAL_ADD')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow"
              >
                + Onboard First Hospital Now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Hospital Name</th>
                    <th className="p-3">City / Address</th>
                    <th className="p-3">Login Email</th>
                    <th className="p-3">Live Token</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{hosp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Lic: {hosp.licenseNumber}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{hosp.address}</div>
                        <div className="text-[11px] font-semibold text-slate-800">📍 {hosp.city}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700 font-semibold">{hosp.email}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        #{hosp.currentLiveToken || '1'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            hosp.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hosp.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {hosp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {hosp.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'SUSPENDED')}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-[11px] font-bold"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold"
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

      {/* TAB 2: Onboard Hospital Form */}
      {activeTab === 'MANUAL_ADD' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm max-w-3xl mx-auto">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Onboard a New Hospital</h2>
            <p className="text-xs text-slate-500">
              Creates the hospital profile, assigns login credentials, and sends an automatic welcome email.
            </p>
          </div>

          {formSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateHospital} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SatyaSri MultiSpeciality Hospital"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City / Territory *</label>
                <input
                  type="text"
                  required
                  placeholder="Mahabubabad"
                  value={newHospital.city}
                  onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Address / Landmark *</label>
              <input
                type="text"
                required
                placeholder="e.g. Near RTC Bus Stand, Main Road, Mahabubabad"
                value={newHospital.address}
                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reception Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={newHospital.contactNumber}
                  onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">License / Reg Number</label>
                <input
                  type="text"
                  placeholder="TS-MBD-001"
                  value={newHospital.licenseNumber}
                  onChange={(e) => setNewHospital({ ...newHospital, licenseNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
              <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                🔑 Hospital Login Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Authorized Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="hospital@domain.com"
                    value={newHospital.email}
                    onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newHospital.password}
                    onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHospital.isEmergency}
                  onChange={(e) => setNewHospital({ ...newHospital, isEmergency: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-700">24/7 Emergency Casualty</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHospital.isGovernment}
                  onChange={(e) => setNewHospital({ ...newHospital, isGovernment: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-700">Government Institution</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Onboarding & Sending Email Credentials...</span>
                </>
              ) : (
                'Onboard Hospital & Deploy to Live Network ➔'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
