'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  contactNumber: string;
  isEmergency: boolean;
  isGovernment: boolean;
  openHours: string;
  status?: string;
  distanceKm?: number;
  currentLiveToken?: string;
  departments?: Array<{ id: string; name: string }>;
  doctors?: Array<{ id: string; specialization: string; user?: { name: string }; name?: string }>;
}

export default function PatientHomePage() {
  const [selectedLocation, setSelectedLocation] = useState<string>('Mahabubabad');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHospitals = () => {
    setLoading(true);
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = backend ? `${backend}/api/hospitals` : '/api/hospitals';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHospitals(data);
        } else {
          setHospitals([]);
        }
      })
      .catch(() => setHospitals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
    // Auto-refresh every 5 seconds to sync live token numbers updated by receptionists
    const interval = setInterval(fetchHospitals, 5000);
    return () => clearInterval(interval);
  }, []);

  const isServedCity = selectedLocation.trim().toLowerCase() === 'mahabubabad';

  // Filter hospitals by search query & department
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.departments?.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      h.doctors?.some((doc) =>
        (doc.user?.name || doc.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (selectedDeptFilter === 'ALL') return true;
    if (selectedDeptFilter === 'EMERGENCY') return h.isEmergency;
    if (selectedDeptFilter === 'GOVT') return h.isGovernment;

    return h.departments?.some((d) =>
      d.name.toLowerCase().includes(selectedDeptFilter.toLowerCase())
    );
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Formal Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Live Hospital OPD Token Platform • Mahabubabad Zone
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find Hospitals & <span className="text-teal-400">Track Live Tokens</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover verified hospitals, view real-time ongoing token numbers being served in doctor rooms, and book your appointment token without standing in lines.
          </p>

          {/* Unified Location + Search Bar */}
          <div className="max-w-3xl mx-auto p-2 bg-slate-950/90 backdrop-blur rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 border-b sm:border-b-0 sm:border-r border-slate-800 w-full sm:w-auto">
              <span className="text-teal-400">📍 City:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-slate-900 text-teal-300 font-bold border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="Mahabubabad">Mahabubabad (Live)</option>
                <option value="Warangal">Warangal</option>
                <option value="Khammam">Khammam</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div className="flex-1 flex items-center w-full px-2">
              <span className="text-slate-500 mr-2">🔍</span>
              <input
                type="text"
                placeholder="Search registered hospitals, doctors, or OPD departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Department Filter Pills */}
          {isServedCity && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-semibold">
              {[
                { id: 'ALL', label: 'All Hospitals' },
                { id: 'General', label: '🩺 General Medicine' },
                { id: 'Cardiology', label: '❤️ Cardiology' },
                { id: 'Orthopedics', label: '🦴 Orthopedics' },
                { id: 'Pediatrics', label: '👶 Pediatrics' },
                { id: 'EMERGENCY', label: '🚨 24/7 Emergency' },
                { id: 'GOVT', label: '🏛️ Govt Hospitals' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedDeptFilter(pill.id)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all ${
                    selectedDeptFilter === pill.id
                      ? 'bg-teal-500 text-slate-950 font-black border-teal-400 shadow-md shadow-teal-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Unserved Location Banner */}
        {!isServedCity && (
          <div className="p-8 bg-amber-500/10 border border-amber-500/30 rounded-3xl text-center space-y-3">
            <span className="text-3xl block">📍</span>
            <h3 className="text-lg font-bold text-amber-400">
              We're currently not live in {selectedLocation}
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Currently, Skip-Q serves live OPD token management in <strong className="text-white">Mahabubabad</strong>.
            </p>
            <button
              onClick={() => setSelectedLocation('Mahabubabad')}
              className="mt-2 px-5 py-2.5 bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow hover:bg-amber-300"
            >
              Switch Location to Mahabubabad
            </button>
          </div>
        )}

        {/* Hospital Cards Grid */}
        {isServedCity && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Registered Hospitals in Mahabubabad</h2>
                <p className="text-xs text-slate-400">View real-time ongoing tokens updated live by hospital reception desks.</p>
              </div>
              <span className="text-xs text-teal-400 font-bold bg-teal-500/10 px-3.5 py-1 rounded-full border border-teal-500/20">
                {filteredHospitals.length} Registered Hospitals
              </span>
            </div>

            {loading && hospitals.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
                Checking registered hospitals in Mahabubabad...
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
                <span className="text-4xl block">🏥</span>
                <h3 className="text-base font-bold text-white">No Hospitals Registered Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Hospital management teams can register their hospital through the Hospital Management Portal or Super Admin Onboarding to begin receiving live token appointments.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href="https://skipq-hospital.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-indigo-400 transition-colors"
                  >
                    Hospital Management Portal ➔
                  </a>
                  <a
                    href="https://skipq-admin.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Admin Onboarding ➔
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHospitals.map((hosp) => (
                  <div
                    key={hosp.id}
                    className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl hover:border-teal-500/40 hover:shadow-teal-500/5 transition-all flex flex-col justify-between"
                  >
                    {/* Visual Banner Header */}
                    <div className="h-44 bg-gradient-to-tr from-slate-950 via-teal-950/60 to-slate-900 p-5 flex flex-col justify-between relative border-b border-slate-800">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur text-[10px] font-bold text-teal-400 border border-teal-500/30 rounded-lg">
                          {hosp.isGovernment ? '🏛️ Govt Hospital' : '🏥 Private Hospital'}
                        </span>
                        {hosp.isEmergency && (
                          <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 rounded-lg">
                            🚨 24/7 Emergency
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg font-black text-white leading-snug">{hosp.name}</h3>
                          <span className="text-teal-400 text-sm" title="Verified Hospital">✓</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">📍 {hosp.address}, {hosp.city}</p>
                      </div>
                    </div>

                    {/* Features & Details */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3 text-xs text-slate-300">
                        {/* Live Ongoing Token Banner */}
                        <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                              NOW IN DOCTOR ROOM
                            </span>
                          </div>
                          <span className="text-base font-mono font-black text-teal-300">
                            Token #{hosp.currentLiveToken || '1'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Rating & Reviews</span>
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            ★ {hosp.rating || 4.8} <span className="text-slate-500 font-normal">({hosp.reviewCount || 1}+)</span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Emergency Phone</span>
                          <span className="text-slate-200 font-mono font-semibold">
                            {hosp.contactNumber}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/hospital/${hosp.id}`}
                        className="block w-full text-center py-3 bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-teal-300 active:scale-95 transition-all"
                      >
                        View OPD & Book Token ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
