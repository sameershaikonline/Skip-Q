'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
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
const SERVICE_RADIUS_KM = 25; // 25km radius for Mahabubabad coverage

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

// In-memory fast cache for instant search results
const searchCache = new Map<string, any[]>();

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: UserLocation) => void;
  currentLocation: UserLocation | null;
  mandatory?: boolean;
}

export default function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
  mandatory = false,
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

  // Ultra-Fast Location Search Autocomplete (Photon sub-100ms API with cache)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchCache.has(trimmed.toLowerCase())) {
      setSearchResults(searchCache.get(trimmed.toLowerCase()) || []);
      return;
    }

    const delay = setTimeout(async () => {
      setSearching(true);
      setErrorMsg('');

      try {
        // Fast Photon Geocoding API
        const photonRes = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6&lang=en`
        );
        const photonData = await photonRes.json();

        if (photonData?.features && photonData.features.length > 0) {
          const formatted = photonData.features.map((f: any) => {
            const props = f.properties || {};
            const coords = f.geometry?.coordinates || [0, 0];
            const city = props.city || props.town || props.village || props.name || props.district || 'Location';
            const state = props.state ? `, ${props.state}` : '';
            const country = props.country ? `, ${props.country}` : '';
            const address = `${props.name || city}${props.street ? `, ${props.street}` : ''}${state}${country}`;
            return {
              display_name: address,
              city,
              lat: coords[1],
              lon: coords[0],
            };
          });

          searchCache.set(trimmed.toLowerCase(), formatted);
          setSearchResults(formatted);
          setSearching(false);
          return;
        }

        // Fallback to Nominatim if photon has 0 matches
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            trimmed
          )}&limit=5&addressdetails=1`
        );
        const data = await res.json();
        const formatted = (data || []).map((item: any) => ({
          display_name: item.display_name,
          city: item.address?.city || item.address?.town || item.address?.village || item.name || 'Location',
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));

        searchCache.set(trimmed.toLowerCase(), formatted);
        setSearchResults(formatted);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setSearching(false);
      }
    }, 150);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Bulletproof Auto-Detect: Browser Geolocation + IP Geocoding Fallback
  const handleDetectCurrentLocation = async () => {
    setDetectingGps(true);
    setErrorMsg('');

    const resolveLocationData = (lat: number, lon: number, cityName: string, fullAddress: string) => {
      const dist = calculateDistanceKm(lat, lon, MBD_LAT, MBD_LON);
      const isMahabubabad =
        cityName.toLowerCase().includes('mahabubabad') ||
        cityName.toLowerCase().includes('mahbubabad') ||
        dist <= SERVICE_RADIUS_KM;

      const locObj: UserLocation = {
        city: isMahabubabad ? 'Mahabubabad' : cityName,
        address: fullAddress,
        lat,
        lon,
        isServed: isMahabubabad,
        distanceKm: dist,
      };

      setSelectedPreview(locObj);
      setDetectingGps(false);
    };

    // 1. Try Browser Geolocation
    if (navigator.geolocation) {
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
              data.address?.county ||
              data.address?.state_district ||
              'Current Location';

            resolveLocationData(lat, lon, city, data.display_name || `${city}, India`);
          } catch {
            resolveLocationData(lat, lon, 'Detected Location', `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        },
        async () => {
          // 2. Geolocation denied/timed out -> Instant IP-based Fallback
          try {
            const ipRes = await fetch('https://ipwho.is/');
            const ipData = await ipRes.json();

            if (ipData && ipData.success !== false) {
              const lat = ipData.latitude || MBD_LAT;
              const lon = ipData.longitude || MBD_LON;
              const city = ipData.city || 'Detected Location';
              const fullAddress = `${city}, ${ipData.region || ''}, ${ipData.country || 'India'}`;
              resolveLocationData(lat, lon, city, fullAddress);
            } else {
              throw new Error('IP lookup failed');
            }
          } catch {
            setDetectingGps(false);
            setErrorMsg('Unable to automatically detect location. Please type your city name in the search box.');
          }
        },
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 60000 }
      );
    } else {
      // Direct IP Fallback if Geolocation is missing
      try {
        const ipRes = await fetch('https://ipwho.is/');
        const ipData = await ipRes.json();
        if (ipData && ipData.success !== false) {
          const lat = ipData.latitude || MBD_LAT;
          const lon = ipData.longitude || MBD_LON;
          const city = ipData.city || 'Detected Location';
          resolveLocationData(lat, lon, city, `${city}, ${ipData.country || 'India'}`);
        } else {
          throw new Error('IP lookup failed');
        }
      } catch {
        setDetectingGps(false);
        setErrorMsg('Please type your city or town name manually.');
      }
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = item.lat;
    const lon = item.lon;
    const city = item.city || 'Location';

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

  const handleConfirmLocation = () => {
    if (selectedPreview) {
      onSelectLocation(selectedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-950/70 transition-all duration-300">
      <div className="glass w-full max-w-xl rounded-[3rem] p-6 sm:p-8 shadow-2xl border-2 border-blue-500/20 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black">
              <Compass className="w-3.5 h-3.5" />
              <span>Location Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Your Location
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              We need your location to display available hospitals and live OPD consultation queues.
            </p>
          </div>

          {!mandatory && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
              <span>Detecting Location...</span>
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
              placeholder="Search town, landmark, district, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
            {searching && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1" />
            )}
          </div>

          {/* Instant Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
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

        {/* Selected Location Details & Notice */}
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

                  {/* USER REQUESTED EXACT SERVICE NOTICE */}
                  {!selectedPreview.isServed ? (
                    <div className="pt-2 text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                      ⚠️ We're serving only in <span className="underline font-black">Mahabubabad</span> right now. We're working hard to bring our services to your location soon!
                    </div>
                  ) : (
                    <p className="text-emerald-700 dark:text-emerald-300 font-bold pt-1">
                      ✅ Live hospital queues and digital consultation tokens are active for your location.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive OpenStreetMap Embed */}
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
              <iframe
                title="Location Map Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPreview.lon - 0.03}%2C${selectedPreview.lat - 0.03}%2C${selectedPreview.lon + 0.03}%2C${selectedPreview.lat + 0.03}&layer=mapnik&marker=${selectedPreview.lat}%2C${selectedPreview.lon}`}
                className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                OpenStreetMap
              </div>
            </div>

            {/* Confirm & Set Location Button */}
            <button
              onClick={handleConfirmLocation}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[2rem] text-sm shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Confirm Location & Browse Hospitals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
