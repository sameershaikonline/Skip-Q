'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Stethoscope,
  X
} from 'lucide-react';

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
    bio?: string;
    fee?: number;
    roomNo?: string;
    user?: { name: string; avatarUrl?: string };
    name?: string;
  }>;
}

export default function PatientHomePage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('Mahabubabad');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Strict Authentication Check: Must be authenticated to view hospital live queues
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setAuthChecking(false);
  }, []);

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

  if (authChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="loader-ring"></div>
        <p className="font-black animate-pulse text-slate-500 uppercase tracking-widest text-xs">
          Verifying Patient Authentication...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 py-8">
      {/* CyberVerify Hero */}
      <div className="text-center mb-12 space-y-6 animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-blue-500 dark:text-blue-400 text-xs font-black shadow-lg shadow-blue-500/10">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          Mahabubabad Outpatient Queue Radar
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
          Skip the hospital line. <br />
          Track <span className="gradient-text">Live Tokens</span>.
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          View exact in-room consultation numbers and generate digital tokens before reaching the clinic.
        </p>

        {/* Glass Search & Location Selector */}
        <div className="max-w-2xl mx-auto p-3 glass rounded-[2rem] shadow-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 w-full sm:w-auto shrink-0">
            <MapPin className="w-4 h-4 text-blue-500" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value="Mahabubabad" className="dark:bg-slate-900">Mahabubabad</option>
              <option value="Warangal" className="dark:bg-slate-900">Warangal</option>
              <option value="Khammam" className="dark:bg-slate-900">Khammam</option>
              <option value="Hyderabad" className="dark:bg-slate-900">Hyderabad</option>
            </select>
          </div>

          <div className="flex-1 flex items-center w-full px-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search hospital, specialist physician, or OPD department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        {isServedCity && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Clinics' },
              { id: 'General', label: 'General OPD' },
              { id: 'Cardiology', label: 'Cardiology' },
              { id: 'Orthopedics', label: 'Orthopedics' },
              { id: 'Pediatrics', label: 'Pediatrics' },
              { id: 'EMERGENCY', label: '24/7 Emergency' },
              { id: 'GOVT', label: 'Govt Hospitals' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSelectedDeptFilter(pill.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedDeptFilter === pill.id
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20'
                    : 'glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Facilities Grid */}
      <section className="space-y-6">
        {!isServedCity ? (
          <div className="glass p-10 rounded-[3rem] text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Not Live in {selectedLocation}
            </h3>
            <p className="text-sm font-medium text-slate-500">
              Skip-Q is currently focused on real-time queues in Mahabubabad. Switch your location to view live clinics.
            </p>
            <button
              onClick={() => setSelectedLocation('Mahabubabad')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              Switch to Mahabubabad
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Verified Facilities ({filteredHospitals.length})
              </h2>
            </div>

            {loading && hospitals.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="loader-ring"></div>
                <p className="font-black animate-pulse text-slate-500 uppercase tracking-widest text-xs">
                  Connecting to Clinic Queues...
                </p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="glass p-12 rounded-[3rem] text-center space-y-4 max-w-md mx-auto shadow-xl">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Hospitals Registered Yet</h3>
                <p className="text-xs text-slate-500">
                  Clean slate: Add facilities via the Super Admin Hub to begin issuing live OPD tokens.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredHospitals.map((hosp) => {
                  const leadDoc = hosp.doctors?.[0];
                  return (
                    <div
                      key={hosp.id}
                      className="group glass p-8 rounded-[2.5rem] cursor-pointer transition-all hover:scale-105 border-b-4 border-transparent hover:border-blue-500 shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        {/* Gradient Icon Badge */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl shadow-lg transition-transform group-hover:rotate-6">
                          <Stethoscope className="w-8 h-8" />
                        </div>

                        {/* Title & Tag */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                              {hosp.name}
                            </h3>
                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            📍 {hosp.address}, {hosp.city}
                          </p>
                        </div>

                        {/* Big Live Token Display Box */}
                        <div className="my-6 p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-blue-500/20 text-center space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block">
                            NOW IN DOCTOR ROOM
                          </span>
                          <div className="text-4xl font-mono font-black tracking-wider">
                            #{hosp.currentLiveToken || '1'}
                          </div>
                          <span className="text-[11px] text-blue-200 font-bold block pt-0.5">
                            ● Live Reception Broadcast
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400 pb-4">
                          {leadDoc && (
                            <p className="text-slate-800 dark:text-slate-200 font-bold">
                              👨‍⚕️ {leadDoc.user?.name || leadDoc.name || 'Attending Physician'} ({leadDoc.specialization})
                            </p>
                          )}
                          <p>🕒 {hosp.openHours || '24/7 Hours'} • 📞 {hosp.contactNumber}</p>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/hospital/${hosp.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-center text-sm shadow-xl shadow-blue-500/30 transition-all block hover:scale-[1.02]"
                      >
                        Book Token & View Details ➔
                      </Link>
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
