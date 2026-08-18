'use client';

import React, { useState, useEffect } from 'react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  email: string;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export default function AdminDashboardPage() {
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

  // Fetch Hospitals from backend
  const fetchHospitals = () => {
    setLoading(true);
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    fetch(`${backend}/api/hospitals`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHospitals(data);
        else setHospitals([]);
      })
      .catch(() => setHospitals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!newHospital.name || !newHospital.address || !newHospital.contactNumber) {
      setFormError('Please fill in required hospital details.');
      return;
    }

    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backend}/api/admin/onboard-hospital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to onboard hospital');
      }

      setFormSuccess(
        `Hospital "${data.hospital.name}" live in ${data.hospital.city}! Hospital Admin Login: Email: ${data.adminUser.email} | Pass: ${data.adminUser.initialPassword}`
      );

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
    } catch (err: any) {
      setFormError(err.message || 'Failed to onboard hospital');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${backend}/api/admin/hospitals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchHospitals();
    } catch (err) {
      alert('Status update failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Super Admin Control Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Mahabubabad Platform Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Onboard new hospitals, approve partner requests, and manage live serve availability.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('HOSPITALS')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'HOSPITALS' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏥 Registered Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('MANUAL_ADD')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'MANUAL_ADD' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ➕ Onboard Hospital Manually
          </button>
        </div>
      </div>

      {/* TAB 1: Hospitals Management Directory */}
      {activeTab === 'HOSPITALS' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">Hospitals Directory (Mahabubabad)</h2>
              <p className="text-xs text-slate-400">Manage live availability and partner approvals.</p>
            </div>
            <button
              onClick={fetchHospitals}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
            >
              🔄 Refresh List
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading hospitals...</div>
            ) : hospitals.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-3xl block">🏥</span>
                <p className="font-bold text-white text-sm">No Hospitals Registered Yet</p>
                <p className="max-w-md mx-auto text-slate-400">
                  Hospitals will appear here when hospital managements sign up or when you onboard hospitals manually.
                </p>
                <button
                  onClick={() => setActiveTab('MANUAL_ADD')}
                  className="px-4 py-2 bg-purple-500 text-slate-950 font-bold rounded-xl hover:bg-purple-400"
                >
                  ➕ Onboard First Hospital Manually
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">HOSPITAL NAME</th>
                    <th className="p-3">CITY & ADDRESS</th>
                    <th className="p-3">CONTACT EMAIL</th>
                    <th className="p-3">LICENSE NO.</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {hospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-950/40">
                      <td className="p-3 font-bold text-white">{h.name}</td>
                      <td className="p-3 text-slate-300">{h.address}, {h.city}</td>
                      <td className="p-3 font-mono">{h.email}</td>
                      <td className="p-3 font-mono text-slate-400">{h.licenseNumber}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            h.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : h.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {h.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(h.id, 'APPROVED')}
                              className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(h.id, 'REJECTED')}
                              className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-lg hover:bg-rose-500/30"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {h.status === 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(h.id, 'SUSPENDED')}
                            className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-lg hover:bg-amber-500/30"
                          >
                            Suspend
                          </button>
                        )}
                        {h.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusChange(h.id, 'APPROVED')}
                            className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-400"
                          >
                            Re-Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Manual Hospital Onboarding Form */}
      {activeTab === 'MANUAL_ADD' && (
        <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">➕ Onboard Hospital Manually</h2>
            <p className="text-xs text-slate-400 mt-1">
              Creates the hospital with instant Approved status and generates hospital management login credentials.
            </p>
          </div>

          {formSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold text-center">
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-400 font-bold text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateHospital} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahabubabad General Hospital"
                value={newHospital.name}
                onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / Location Zone *</label>
                <input
                  type="text"
                  required
                  value={newHospital.city}
                  onChange={(e) => setNewHospital({ ...newHospital, city: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newHospital.contactNumber}
                  onChange={(e) => setNewHospital({ ...newHospital, contactNumber: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. Station Road, Mahabubabad"
                value={newHospital.address}
                onChange={(e) => setNewHospital({ ...newHospital, address: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital Management Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="hospital@example.com"
                  value={newHospital.email}
                  onChange={(e) => setNewHospital({ ...newHospital, email: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  placeholder="hospital123"
                  value={newHospital.password}
                  onChange={(e) => setNewHospital({ ...newHospital, password: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Medical License Number</label>
              <input
                type="text"
                placeholder="e.g. MBD-LIC-9821"
                value={newHospital.licenseNumber}
                onChange={(e) => setNewHospital({ ...newHospital, licenseNumber: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-purple-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-purple-400 transition-colors"
            >
              ➕ Save & Onboard Hospital Immediately
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
