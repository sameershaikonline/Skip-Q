'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  ArrowRight,
  Compass
} from 'lucide-react';

export interface UserLocation {
  city: string;
  address: string;
  lat: number;
  lon: number;
  isServed: boolean;
  distanceKm?: number;
}

// Center coordinates for Mahabubabad, Telangana
const MBD_LAT = 17.5986;
const MBD_LON = 80.0035;
const SERVICE_RADIUS_KM = 25; // Serving within 25km radius of Mahabubabad town

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: UserLocation) => void;
  currentLocation: UserLocation | null;
}

export default function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<UserLocation | null>(currentLocation);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentLocation) {
      setSelectedPreview(currentLocation);
    }
  }, [currentLocation]);

  // OpenStreetMap Search Autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setSearching(true);
      setErrorMsg('');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery.trim()
          )}&countrycodes=in&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.warn('OpenStreetMap search error:', err);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // GPS Auto-detect using browser geolocation and OpenStreetMap reverse geocoding
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
          );
          const data = await res.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.suburb ||
            data.address?.county ||
            data.address?.state_district ||
            'Mahabubabad';

          const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
          const isMahabubabad =
            city.toLowerCase().includes('mahabubabad') ||
            city.toLowerCase().includes('mahbubabad') ||
            dist <= SERVICE_RADIUS_KM;

          const locObj: UserLocation = {
            city: isMahabubabad ? 'Mahabubabad' : city,
            address: data.display_name || `${city}, Telangana`,
            lat,
            lon,
            isServed: isMahabubabad,
            distanceKm: dist,
          };

          setSelectedPreview(locObj);
        } catch (err) {
          // Fallback if reverse geocode fails
          const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
          const isMahabubabad = dist <= SERVICE_RADIUS_KM;
          const locObj: UserLocation = {
            city: isMahabubabad ? 'Mahabubabad' : 'Detected Location',
            address: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
            lat,
            lon,
            isServed: isMahabubabad,
            distanceKm: dist,
          };
          setSelectedPreview(locObj);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setDetectingGps(false);
        setErrorMsg('Location access was denied or timed out. Please type your location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.state_district ||
      item.name ||
      'Location';

    const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
    const isMahabubabad =
      city.toLowerCase().includes('mahabubabad') ||
      city.toLowerCase().includes('mahbubabad') ||
      item.display_name.toLowerCase().includes('mahabubabad') ||
      dist <= SERVICE_RADIUS_KM;

    const locObj: UserLocation = {
      city: isMahabubabad ? 'Mahabubabad' : city,
      address: item.display_name,
      lat,
      lon,
      isServed: isMahabubabad,
      distanceKm: dist,
    };

    setSelectedPreview(locObj);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleQuickPick = (city: string, lat: number, lon: number, isServed: boolean) => {
    const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
    const locObj: UserLocation = {
      city,
      address: `${city}, Telangana, India`,
      lat,
      lon,
      isServed,
      distanceKm: dist,
    };
    setSelectedPreview(locObj);
  };

  const handleConfirmLocation = () => {
    if (selectedPreview) {
      onSelectLocation(selectedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/70 transition-all duration-300">
      <div className="glass w-full max-w-2xl rounded-[3rem] p-6 sm:p-8 shadow-2xl border-2 border-blue-500/20 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black">
              <Compass className="w-3.5 h-3.5" />
              <span>Zomato-Style Location Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Your Location
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              We need your location to show available clinics and live OPD consultation queues.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <button
          onClick={handleDetectCurrentLocation}
          disabled={detectingGps}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all"
        >
          {detectingGps ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Detecting GPS Location via OpenStreetMap...</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5 animate-pulse" />
              <span>Use Current GPS Location (Auto-Detect)</span>
            </>
          )}
        </button>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold rounded-2xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Search Location Bar */}
        <div className="relative">
          <div className="flex items-center p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-blue-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search town, colony, landmark, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            {searching && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full p-3.5 text-left text-xs font-medium hover:bg-blue-500/10 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-800 dark:text-slate-200 line-clamp-2">
                    {item.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Pick Popular Cities */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
            Popular Areas
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Mahabubabad Town', lat: 17.5986, lon: 80.0035, served: true },
              { name: 'Kesamudram', lat: 17.712, lon: 79.914, served: true },
              { name: 'Thorrur', lat: 17.541, lon: 79.743, served: true },
              { name: 'Nellikudur', lat: 17.558, lon: 79.897, served: true },
              { name: 'Warangal', lat: 17.9689, lon: 79.5941, served: false },
              { name: 'Khammam', lat: 17.2473, lon: 80.1514, served: false },
              { name: 'Hyderabad', lat: 17.385, lon: 78.4867, served: false },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPick(p.name, p.lat, p.lon, p.served)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPreview?.city === p.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'glass text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.served ? '📍 ' : '⚪ '}
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Map Preview & Status */}
        {selectedPreview && (
          <div className="space-y-4">
            <div
              className={`p-5 rounded-3xl border-2 transition-all ${
                selectedPreview.isServed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {selectedPreview.isServed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {selectedPreview.city}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        selectedPreview.isServed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {selectedPreview.isServed ? 'Live In-Service' : 'Service Coming Soon'}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2">
                    {selectedPreview.address}
                  </p>

                  {/* EXACT USER-REQUESTED MESSAGE WHEN OUTSIDE MAHABUBABAD */}
                  {!selectedPreview.isServed ? (
                    <div className="pt-2 text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                      ⚠️ We're serving only in <span className="underline font-black">Mahabubabad</span> right now. We're working hard to bring our services to your location soon!
                    </div>
                  ) : (
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold pt-1">
                      ✅ Live hospital outpatient queues and digital tokens are active for your area.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* OpenStreetMap Interactive Embed Preview */}
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
              <iframe
                title="Location Map Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPreview.lon - 0.04}%2C${selectedPreview.lat - 0.04}%2C${selectedPreview.lon + 0.04}%2C${selectedPreview.lat + 0.04}&layer=mapnik&marker=${selectedPreview.lat}%2C${selectedPreview.lon}`}
                className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                OpenStreetMap Live Layer
              </div>
            </div>

            {/* Confirm / Continue Button */}
            <button
              onClick={handleConfirmLocation}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Set Location & Browse Clinics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
