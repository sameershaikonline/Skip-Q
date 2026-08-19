'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

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
        throw new Error(data.message || 'Failed to onboard facility');
      }

      setFormSuccess(`Facility "${newHospital.name}" successfully created in database. Access credentials dispatched via email.`);
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
      <div className="max-w-md mx-auto my-32 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Verifying Administrator Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Skip-Q Governance Hub</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Master Access
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Healthcare facility validation, credential assignment, and platform governance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setActiveTab('HOSPITALS')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'HOSPITALS' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Facilities ({hospitals.length})
            </button>
            <button
              onClick={() => setActiveTab('MANUAL_ADD')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'MANUAL_ADD' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Onboard Facility
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Registered Facilities</span>
          <div className="text-2xl font-bold text-slate-900">{hospitals.length}</div>
          <p className="text-[11px] text-slate-400">Database Records</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Region</span>
          <div className="text-2xl font-bold text-slate-900">Mahabubabad</div>
          <p className="text-[11px] text-slate-400">Primary District</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">PostgreSQL Status</span>
          <div className="text-2xl font-bold text-teal-800">Operational</div>
          <p className="text-[11px] text-slate-400">Auto-sync 4s</p>
        </div>
      </div>

      {/* TAB 1: Hospitals Directory */}
      {activeTab === 'HOSPITALS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Healthcare Facilities Roster</h2>
              <p className="text-xs text-slate-500">Supervise facility status and live consultation tokens</p>
            </div>
            <button
              onClick={fetchHospitals}
              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Retrieving facilities...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <p>No facilities found in database.</p>
              <button
                onClick={() => setActiveTab('MANUAL_ADD')}
                className="px-3.5 py-2 bg-slate-900 text-white font-medium text-xs rounded-lg"
              >
                + Onboard First Facility
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Facility Name</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Assigned Login</th>
                    <th className="p-2.5">Live Token</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitals.map((hosp) => (
                    <tr key={hosp.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-900">{hosp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Lic: {hosp.licenseNumber}</div>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        <div>{hosp.address}</div>
                        <div className="text-[11px] font-medium text-slate-800">{hosp.city}</div>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700">{hosp.email}</td>
                      <td className="p-2.5 font-mono font-bold text-teal-800">
                        #{hosp.currentLiveToken || '1'}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hosp.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {hosp.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        {hosp.status === 'APPROVED' ? (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'SUSPENDED')}
                            className="px-2.5 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-[11px] font-medium"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(hosp.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded text-[11px] font-medium"
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Onboard Healthcare Facility</h2>
            <p className="text-xs text-slate-500">
              Initialize database record and issue reception credentials via automated email
            </p>
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

          <form onSubmit={handleCreateHospital} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SatyaSri MultiSpeciality Hospital"
                  value={newHospital.name}
                  onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  required
                  placeholder="Mahabubabad"
                  value={newHospital.city}
                  onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Address / Landmark</label>
              <input
                type="text"
                required
                placeholder="Main Road, Mahabubabad"
                value={newHospital.address}
                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reception Contact</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={newHospital.contactNumber}
                  onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Registration License</label>
                <input
                  type="text"
                  placeholder="TS-MBD-001"
                  value={newHospital.licenseNumber}
                  onChange={(e) => setNewHospital({ ...newHospital, licenseNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                Reception Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Authorized Email</label>
                  <input
                    type="email"
                    required
                    placeholder="reception@hospital.com"
                    value={newHospital.email}
                    onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newHospital.password}
                    onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHospital.isEmergency}
                  onChange={(e) => setNewHospital({ ...newHospital, isEmergency: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-slate-900"
                />
                <span className="text-slate-700">24/7 Emergency</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newHospital.isGovernment}
                  onChange={(e) => setNewHospital({ ...newHospital, isGovernment: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-slate-900"
                />
                <span className="text-slate-700">Government Institution</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Facility...</span>
                </>
              ) : (
                'Onboard Facility & Dispatch Credentials'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
