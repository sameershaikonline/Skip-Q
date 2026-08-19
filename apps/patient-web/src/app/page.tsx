'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Building2,
  Clock,
  Phone,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Radio,
  SlidersHorizontal,
  X,
  Hospital as HospitalIcon,
  AlertCircle
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
    <div className="space-y-10 pb-20">
      {/* Enterprise Healthcare Hero */}
      <section className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              Live Queue Broadcast • Mahabubabad District
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Hospital Outpatient Tokens & Real-Time Queue
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Check real-time consultation room status at verified hospitals across Mahabubabad. Generate your appointment token online to minimize waiting area congestion.
            </p>
          </div>

          {/* Clean Search & Location Selector */}
          <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200 w-full sm:w-auto shrink-0">
              <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-slate-900 font-semibold focus:outline-none text-xs cursor-pointer"
              >
                <option value="Mahabubabad">Mahabubabad</option>
                <option value="Warangal">Warangal</option>
                <option value="Khammam">Khammam</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div className="flex-1 flex items-center w-full px-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search hospital name, doctor, or medical specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-1.5 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter Pills */}
          {isServedCity && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Hospitals' },
                { id: 'General', label: 'General OPD' },
                { id: 'Cardiology', label: 'Cardiology' },
                { id: 'Orthopedics', label: 'Orthopedics' },
                { id: 'Pediatrics', label: 'Pediatrics' },
                { id: 'EMERGENCY', label: 'Emergency 24/7' },
                { id: 'GOVT', label: 'Government' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedDeptFilter(pill.id)}
                  className={`px-3 py-1 rounded-md border transition-colors ${
                    selectedDeptFilter === pill.id
                      ? 'bg-slate-900 text-white font-medium border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {!isServedCity ? (
          <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-3 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">
              Service Unavailable in {selectedLocation}
            </h3>
            <p className="text-xs text-slate-500">
              Skip-Q is actively onboarding healthcare facilities in Mahabubabad. Select Mahabubabad to view available hospital queues.
            </p>
            <button
              onClick={() => setSelectedLocation('Mahabubabad')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800"
            >
              Switch Location to Mahabubabad
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Participating Healthcare Centers
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time status synchronized with on-site reception management
                </p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {filteredHospitals.length} Verified Facilities
              </span>
            </div>

            {loading && hospitals.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Retrieving queue updates...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3 max-w-md mx-auto">
                <HospitalIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-900">No Hospitals Found</h3>
                <p className="text-xs text-slate-500">
                  No registered facilities match your search query in this region.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHospitals.map((hosp) => {
                  const leadDoctor = hosp.doctors?.[0];
                  return (
                    <div
                      key={hosp.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      {/* Facility Header */}
                      <div className="p-5 border-b border-slate-100 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-base font-semibold text-slate-900">{hosp.name}</h3>
                              <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{hosp.address}, {hosp.city}</span>
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded border border-slate-200 shrink-0">
                            {hosp.isGovernment ? 'Government' : 'Private'}
                          </span>
                        </div>

                        {/* Professional Live Token Box */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                                In Consultation Room
                              </span>
                              <span className="text-xs font-medium text-slate-800">Live Calling</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-mono font-bold text-teal-800">
                              #{hosp.currentLiveToken || '1'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Doctor & Facility Meta */}
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-slate-50/50">
                        <div className="space-y-2.5 text-xs text-slate-600">
                          {leadDoctor ? (
                            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
                              <p className="font-medium text-slate-900 flex items-center gap-1.5">
                                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                                <span>{leadDoctor.user?.name || leadDoctor.name || 'Specialist Physician'}</span>
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {leadDoctor.specialization} • {leadDoctor.qualification || 'MBBS, MD'}
                              </p>
                              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-600 border-t border-slate-100">
                                <span>Fee: ₹{leadDoctor.fee || 300}</span>
                                <span className="text-emerald-700 font-medium">Available</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic py-1">
                              General Consultation Available
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> Hours
                            </span>
                            <span className="font-medium text-slate-700">{hosp.openHours || '24 Hours'}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> Reception
                            </span>
                            <span className="font-mono text-slate-700">{hosp.contactNumber}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-2">
                          <Link
                            href={`/hospital/${hosp.id}`}
                            className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <span>Book Token & Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
