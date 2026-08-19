import React, { useState } from 'react';
import { useSolar } from '../context/SolarContext';
import { LocationCoordinates } from '../utils/solarCalculator';
import { MapPin, Navigation, Compass, Globe, Check, X, AlertCircle } from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const { location, setLocation, isLocating, locationError, detectGpsLocation, presetCities } = useSolar();

  const [customLat, setCustomLat] = useState<string>(location.latitude.toString());
  const [customLng, setCustomLng] = useState<string>(location.longitude.toString());
  const [customCity, setCustomCity] = useState<string>(location.city || '');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [inputError, setInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (city: LocationCoordinates) => {
    setLocation(city);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setInputError('Latitude must be a valid number between -90 and +90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setInputError('Longitude must be a valid number between -180 and +180.');
      return;
    }

    setLocation({
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lng * 10000) / 10000,
      city: customCity.trim() || 'Custom Coordinates',
      country: 'Custom Location',
      source: 'custom',
    });
    setInputError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
              Solar Coordinates & Location
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sun phases (Sunrise, Solar Noon, Sunset & Twilights) are calculated precisely from your latitude and longitude.
            </p>
          </div>
        </div>

        {/* Current Active Location Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{location.city || 'Custom Coordinates'}</span>
                {location.country && (
                  <span className="text-xs text-slate-400">({location.country})</span>
                )}
                {location.source === 'gps' && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    GPS Live
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-amber-400/90 mt-0.5">
                {Math.abs(location.latitude)}° {location.latitude >= 0 ? 'N' : 'S'}, {Math.abs(location.longitude)}° {location.longitude >= 0 ? 'E' : 'W'}
              </p>
            </div>
          </div>

          <button
            onClick={detectGpsLocation}
            disabled={isLocating}
            className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'Use GPS'}</span>
          </button>
        </div>

        {locationError && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{locationError}</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Popular City Presets</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Custom Coordinates</span>
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="overflow-y-auto max-h-64 pr-1 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetCities.map((city) => {
                const isCurrent =
                  Math.abs(location.latitude - city.latitude) < 0.01 &&
                  Math.abs(location.longitude - city.longitude) < 0.01;

                return (
                  <button
                    key={`${city.city}-${city.country}`}
                    onClick={() => handleSelectPreset(city)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-100 group-hover:text-amber-300 transition-colors">
                        {city.city}
                      </div>
                      <div className="text-[10px] text-slate-500">{city.country}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {city.latitude}° N, {city.longitude}° E
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Custom Coordinates */}
        {activeTab === 'custom' && (
          <form onSubmit={handleApplyCustom} className="space-y-4">
            {inputError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                {inputError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location / City Label (Optional)
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                placeholder="e.g. My Home Observatory"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Latitude (-90 to +90)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="37.7749"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Longitude (-180 to +180)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="-122.4194"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
              >
                Save Coordinates
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
