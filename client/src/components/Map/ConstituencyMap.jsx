import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

let mapsKeyPromise = null;
function getMapsKey() {
  if (!mapsKeyPromise) {
    mapsKeyPromise = fetch('/api/config').then((r) => r.json()).then((d) => d.mapsKey).catch(() => '');
  }
  return mapsKeyPromise;
}

function loadMapsScript(key) {
  if (!key) return;
  if (document.getElementById('gmap-script') || window.google) return;
  const s = document.createElement('script');
  s.id = 'gmap-script';
  s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
  s.async = true;
  document.head.appendChild(s);
}

export default function ConstituencyMap({ state }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [googleReady, setGoogleReady] = useState(!!window.google);

  useEffect(() => {
    getMapsKey().then((key) => {
      loadMapsScript(key);
      const t = setInterval(() => {
        if (window.google) { clearInterval(t); setGoogleReady(true); }
      }, 300);
      return () => clearInterval(t);
    });
  }, []);

  useEffect(() => {
    if (!googleReady || !mapRef.current) return;
    const geocoder = new window.google.maps.Geocoder();
    const query = state ? `${state}, India` : 'India';

    geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: results[0].geometry.location,
          zoom: state ? 7 : 5,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#0f1d3d' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
            { featureType: 'road', stylers: [{ visibility: 'simplified' }] },
          ],
          disableDefaultUI: true,
          zoomControl: true,
        });
        new window.google.maps.Marker({
          map,
          position: results[0].geometry.location,
          title: query,
        });
        setMapLoaded(true);
      }
    });
  }, [googleReady, state]);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: '200px' }}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center glass">
          <MapPin size={24} className="text-saffron-400 mb-2" />
          <p className="text-slate-400 text-xs">Loading map…</p>
        </div>
      )}
    </div>
  );
}
