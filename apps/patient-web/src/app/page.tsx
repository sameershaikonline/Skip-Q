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
  currentLiveToken?: string;
  departments?: Array<{ id: string; name: string }>;
  doctors?: Array<{
    id: string;
    specialization: string;
    qualification?: string;
    fee?: number;
    roomNo?: string;
    user?: { name: string };
    name?: string;
  }>;
}

export default function PatientHomePage() {
  const [selectedLocation, setSelectedLocation] = useState<string>('Mahabubabad');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHospitals = () => {
    fetch('/api/hospitals')
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
    const interval = setInterval(fetchHospitals, 4000);
    return () => clearInterval(interval);
  }, []);

  const isServedCity = selectedLocation.trim().toLowerCase() === 'mahabubabad';

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
    <div className="space-y-12 pb-24">
      {/* Human-Crafted Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50 border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Live System Beacon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 shadow-sm text-emerald-800 text-xs font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Hospital OPD Token Network • Mahabubabad
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Know your token number <br className="hidden sm:block" />
            <span className="text-emerald-600">before reaching the hospital.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            See the exact ongoing token currently inside the doctor’s consultation room in real-time. Book your digital OPD token online and walk in right on time.
          </p>

          {/* Unified Location & Search Bar */}
          <div className="max-w-2xl mx-auto p-2 bg-white rounded-2xl border border-slate-300 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200 w-full sm:w-auto">
              <span className="text-emerald-600">📍</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none text-xs cursor-pointer"
              >
                <option value="Mahabubabad">Mahabubabad (Live)</option>
                <option value="Warangal">Warangal</option>
                <option value="Khammam">Khammam</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div className="flex-1 flex items-center w-full px-2">
              <span className="text-slate-400 mr-2">🔍</span>
              <input
                type="text"
                placeholder="Search hospital name, specialist doctor, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Specialty Filter Buttons */}
          {isServedCity && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs font-semibold">
              {[
                { id: 'ALL', label: 'All Clinics & Hospitals' },
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
                      ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {!isServedCity ? (
          <div className="p-10 bg-amber-50 border border-amber-200 rounded-3xl text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-4xl block">📍</span>
            <h3 className="text-base font-bold text-amber-900">
              Skip-Q is currently operating in Mahabubabad
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              We are rapidly expanding to {selectedLocation}. Select Mahabubabad to explore registered hospitals with live queue tracking.
            </p>
            <button
              onClick={() => setSelectedLocation('Mahabubabad')}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-700"
            >
              Switch to Mahabubabad
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Verified Hospitals in Mahabubabad
                </h2>
                <p className="text-xs text-slate-500">
                  Live OPD token numbers are directly updated by the hospital reception desks.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                {filteredHospitals.length} Verified Hospitals Live
              </span>
            </div>

            {/* Animated Loading Skeleton */}
            {loading && hospitals.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600 animate-pulse">
                  Connecting to live Mahabubabad hospital queue radar...
                </p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                  🏥
                </div>
                <h3 className="text-base font-bold text-slate-900">No Hospitals Listed Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hospital reception teams can register through the Hospital Portal or Super Admin Hub to start issuing live tokens.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href="https://skipq-hospital.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700"
                  >
                    Hospital Partner Portal ➔
                  </a>
                  <a
                    href="https://skipq-admin.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
                  >
                    Admin Hub ➔
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHospitals.map((hosp) => {
                  const leadDoctor = hosp.doctors?.[0];
                  return (
                    <div
                      key={hosp.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm card-hover flex flex-col justify-between"
                    >
                      {/* Hospital Header */}
                      <div className="p-5 border-b border-slate-100 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-base font-bold text-slate-900">{hosp.name}</h3>
                              <span className="text-emerald-600 text-sm" title="Verified Hospital">✓</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              📍 {hosp.address}, {hosp.city}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md shrink-0">
                            {hosp.isGovernment ? 'Govt Hospital' : 'Private Clinic'}
                          </span>
                        </div>

                        {/* LIVE BEACON: Current Ongoing Token */}
                        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                            </span>
                            <div>
                              <span className="text-[10px] uppercase font-extrabold text-emerald-900 tracking-wider block">
                                In Doctor Room Now
                              </span>
                              <span className="text-[11px] text-emerald-700">Live Consultation</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-mono font-black text-emerald-700">
                              #{hosp.currentLiveToken || '1'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor & Details Section */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-slate-50/40">
                        <div className="space-y-2.5 text-xs text-slate-600">
                          {leadDoctor ? (
                            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>👨‍⚕️</span> {leadDoctor.user?.name || leadDoctor.name || 'Specialist Doctor'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {leadDoctor.specialization} • {leadDoctor.qualification || 'MBBS, MD'}
                              </p>
                              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-600 font-semibold border-t border-slate-100">
                                <span>OPD Fee: ₹{leadDoctor.fee || 300}</span>
                                <span className="text-emerald-600">Available Today</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">
                              General OPD Consultation Available
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                            <span>🕒 Open Hours</span>
                            <span className="font-medium text-slate-700">{hosp.openHours || '24/7'}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span>📞 Reception Desk</span>
                            <span className="font-mono font-semibold text-slate-700">{hosp.contactNumber}</span>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-3">
                          <Link
                            href={`/hospital/${hosp.id}`}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm text-center block transition-colors"
                          >
                            Book OPD Token & View Doctors ➔
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
