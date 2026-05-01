import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Map } from 'lucide-react';

let mapsKeyPromise = null;
function getMapsKey() {
  if (!mapsKeyPromise) {
    mapsKeyPromise = fetch('/api/config').then((r) => r.json()).then((d) => d.mapsKey).catch(() => '');
  }
  return mapsKeyPromise;
}

function loadScript(key) {
  if (document.getElementById('gmap-script')) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 10000;
      const check = setInterval(() => {
        if (window.google) { clearInterval(check); resolve(); }
        else if (Date.now() > deadline) { clearInterval(check); reject(new Error('timeout')); }
      }, 150);
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.id = 'gmap-script';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

const BOOTH_ICON = () => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  scale: 7,
  fillColor: '#f97316',
  fillOpacity: 0.9,
  strokeColor: '#ffffff',
  strokeWeight: 2,
});

const LIGHT_STYLES = [
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9c9c9' }] },
];

function addBoothMarkers(map, center) {
  const svc = new window.google.maps.places.PlacesService(map);
  const done = new Set();

  function trySearch(request) {
    svc.nearbySearch(request, (results, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK) return;
      results.slice(0, 12).forEach((place) => {
        if (done.has(place.place_id)) return;
        done.add(place.place_id);
        const marker = new window.google.maps.Marker({
          map,
          position: place.geometry.location,
          title: place.name,
          icon: BOOTH_ICON(),
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-size:12px;font-weight:600;color:#1e293b;max-width:180px">${place.name}</div>`,
        });
        marker.addListener('click', () => info.open(map, marker));
      });
    });
  }

  trySearch({ location: center, radius: 25000, keyword: 'polling booth election booth ECI' });
  trySearch({ location: center, radius: 25000, type: 'local_government_office' });
}

export default function ConstituencyMap({ state }) {
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading');

  const buildMap = useCallback((center, zoom) => {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: LIGHT_STYLES,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      backgroundColor: '#ffffff',
    });
    new window.google.maps.Marker({
      map,
      position: center,
      title: state || 'Your location',
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
        scale: 5,
        fillColor: '#1e40af',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
    addBoothMarkers(map, center);
    setStatus('ready');
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    async function init() {
      const key = await getMapsKey();
      if (!key) { setStatus('error'); return; }
      try { await loadScript(key); } catch { setStatus('error'); return; }
      if (cancelled) return;

      if (state) {
        new window.google.maps.Geocoder().geocode(
          { address: `${state}, India` },
          (results, s) => {
            if (cancelled) return;
            if (s === 'OK' && results[0]) buildMap(results[0].geometry.location, 10);
            else buildMap({ lat: 20.5937, lng: 78.9629 }, 5);
          }
        );
      } else {
        navigator.geolocation?.getCurrentPosition(
          (pos) => { if (!cancelled) buildMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 12); },
          () => { if (!cancelled) buildMap({ lat: 20.5937, lng: 78.9629 }, 5); },
          { timeout: 5000 }
        );
      }
    }

    init();
    return () => { cancelled = true; };
  }, [state, buildMap]);

  return (
    <div className="relative rounded-xl overflow-hidden w-full h-full bg-slate-100">
      <div ref={mapRef} className="w-full h-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-xl">
          <Loader2 size={18} className="text-saffron-400 animate-spin mb-1" />
          <p className="text-slate-500 text-xs">Finding polling booths…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-xl gap-1">
          <Map size={18} className="text-slate-400" />
          <p className="text-slate-500 text-xs text-center px-4">Map unavailable.<br />Check API key configuration.</p>
        </div>
      )}
    </div>
  );
}
