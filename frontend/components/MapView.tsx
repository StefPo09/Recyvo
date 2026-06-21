"use client";

import { useEffect, useRef, useState } from "react";
import { listBins, addBin } from "@/lib/api";

declare global {
  interface Window {
    L: any;
  }
}

export default function MapView({
  bins: propBins,
  places: propPlaces,
}: {
  bins?: any[];
  places?: any[];
  enableAdd?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any | null>(null);
  const [addingPos, setAddingPos] = useState<{ lat: number; lng: number } | null>(null);
  const [addingType, setAddingType] = useState("plastic");
  const [addingAddr, setAddingAddr] = useState(""); // used as Name/Address field
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [bins, setBins] = useState<any[]>(propBins || []);
  const [places, setPlaces] = useState<any[]>(propPlaces || []);

  // sync props
  useEffect(() => {
    if (propBins) setBins(propBins);
  }, [propBins]);
  useEffect(() => {
    if (propPlaces) setPlaces(propPlaces);
  }, [propPlaces]);

  useEffect(() => {
    if (!mapRef.current) return;

    function initLeaflet() {
      if (!window.L) {
        console.error("Leaflet not available on window");
        return;
      }
      const L = window.L;
      if (leafletMapRef.current) return;

      const map = L.map(mapRef.current).setView([44.439663, 26.096306], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      leafletMapRef.current = map;
      // nothing extra to attach on init; we only support add-by-current-location now
    }

    if (window.L) {
      initLeaflet();
    } else {
      const scriptId = "leaflet-cdn-script";
      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.async = true;
        s.onload = () => initLeaflet();
        s.onerror = () => console.error("Failed to load Leaflet script from CDN");
        document.body.appendChild(s);
      } else {
        const existing = document.getElementById(scriptId) as HTMLScriptElement;
        existing.addEventListener("load", initLeaflet);
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapRef]);

  // click-based adding removed: we only support adding at current location

  // render markers when bins, places or current location change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    // clear existing
    if ((map as any)._customMarkers) (map as any)._customMarkers.forEach((m: any) => m.remove());
    if ((map as any)._customPlaces) (map as any)._customPlaces.forEach((m: any) => m.remove());
    // remove previous current location marker
    if ((map as any)._currentLocationMarker) {
      try {
        (map as any)._currentLocationMarker.remove();
      } catch (e) {}
      (map as any)._currentLocationMarker = null;
    }

    const created: any[] = [];
    bins.forEach((b) => {
      try {
        // choose color by bin type
        const t = (b.bin_type || "").toLowerCase();
        let color = "#9ca3af"; // grey default (household/general)
        if (t === "plastic" || t === "metal") color = "#facc15"; // yellow for plastic & metal
        else if (t === "sticla" || t === "glass") color = "#16a34a"; // green for glass
        else if (t === "hartie" || t === "paper") color = "#3b82f6"; // blue for paper
        else if (t === "electronic") color = "#6b7280"; // neutral/grey

         const marker = L.circleMarker([b.lat, b.lng], { radius: 8, color }).addTo(map);
         // popup content with maps links
         const googleMapsUrl = `https://www.google.com/maps?q=${b.lat},${b.lng}`;
         const appleMapsUrl = `https://maps.apple.com/?daddr=${b.lat},${b.lng}`;
         const popupContent = `
           <div class="text-sm" style="max-width: 200px;">
             <div class="font-semibold">${b.address || 'Recycling Bin'}</div>
             <div class="text-xs text-gray-600 mb-2">Type: ${b.bin_type}</div>
             <div class="flex gap-2">
               <a href="${googleMapsUrl}" target="_blank" style="color: #4285F4; text-decoration: none; font-size: 0.75rem;">Google Maps</a>
               <a href="${appleMapsUrl}" target="_blank" style="color: #555; text-decoration: none; font-size: 0.75rem;">Apple Maps</a>
             </div>
           </div>
         `;
         marker.bindPopup(popupContent);
        created.push(marker);
      } catch (e) {}
    });
    (map as any)._customMarkers = created;

    const createdPlaces: any[] = [];
    places.forEach((p) => {
      try {
         const marker = L.circleMarker([p.latitude, p.longitude], { radius: 7, color: "#1e3a8a" }).addTo(map);
         const googleMapsUrl = `https://www.google.com/maps?q=${p.latitude},${p.longitude}`;
         const appleMapsUrl = `https://maps.apple.com/?daddr=${p.latitude},${p.longitude}`;
         const popupContent = `
           <div class="text-sm" style="max-width: 200px;">
             <div class="font-semibold">${p.name}</div>
             <div class="text-xs text-gray-600 mb-2">${p.address}</div>
             <div class="flex gap-2">
               <a href="${googleMapsUrl}" target="_blank" style="color: #4285F4; text-decoration: none; font-size: 0.75rem;">Google Maps</a>
               <a href="${appleMapsUrl}" target="_blank" style="color: #555; text-decoration: none; font-size: 0.75rem;">Apple Maps</a>
             </div>
           </div>
         `;
         marker.bindPopup(popupContent);
        createdPlaces.push(marker);
      } catch (e) {}
    });
    (map as any)._customPlaces = createdPlaces;

    // render a temporary marker for the adding position (if present)
    if ((map as any)._addingMarker) {
      try {
        (map as any)._addingMarker.remove();
      } catch (e) {}
      (map as any)._addingMarker = null;
    }
    if (addingPos) {
      try {
        const a = L.circleMarker([addingPos.lat, addingPos.lng], { radius: 8, color: "#f97316" }).addTo(map);
        a.bindPopup(`<div class="text-sm">New bin location</div>`);
        (map as any)._addingMarker = a;
      } catch (e) {}
    }

    // render current location marker if available
    if (currentLocation) {
      try {
        const locMarker = L.circleMarker([currentLocation.lat, currentLocation.lng], { radius: 8, color: "#ef4444" }).addTo(map);
        locMarker.bindPopup(`<div class=\\"text-sm\\">You are here</div>`);
        (map as any)._currentLocationMarker = locMarker;
      } catch (e) {}
    }
  }, [bins, places, currentLocation]);

  // popup delete handler removed — delete button has been removed from popups

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addingPos) return;
    setLoading(true);
    try {
      await addBin({ lat: addingPos.lat, lng: addingPos.lng, address: addingAddr, bin_type: addingType });
      console.log('Added bin at', addingPos);
      setStatusMsg(`Added bin at ${addingPos.lat.toFixed(5)}, ${addingPos.lng.toFixed(5)}`);
      // refresh bins list locally
      try {
        const all = await listBins();
        setBins(all || []);
      } catch (err) {}
      setAddingPos(null);
      setAddingAddr("");
    } catch (err) {
      console.error("Add bin error:", err);
      const message = String(err instanceof Error ? err.message : err);
      setStatusMsg(`Add failed: ${message}`);
      // If it's a network error give a helpful hint
      if (message.includes("Network error when calling") || message.includes("Failed to fetch")) {
        alert("Failed to add bin: could not reach the API.\n" + message + "\n\nPlease ensure the backend is running and that NEXT_PUBLIC_API_URL is set correctly.");
      } else {
        alert("Failed to add bin: " + message);
      }
    } finally {
      setLoading(false);
    }
  }

  function requestCurrentLocation(setAsAdding = false) {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLocation({ lat, lng });
        // if leaflet map is ready, pan to the location and add a temporary marker
        try {
          const map = leafletMapRef.current;
          if (map && (window as any).L) {
            map.setView([lat, lng], 14);
            // attach/update a small marker for immediate feedback (effect will also render one)
            const L = (window as any).L;
            if ((map as any)._userMarker) {
              try {
                (map as any)._userMarker.setLatLng([lat, lng]);
              } catch (e) {}
            } else {
              try {
                const m = L.circleMarker([lat, lng], { radius: 8, color: "#ef4444" }).addTo(map);
                m.bindPopup("You are here");
                (map as any)._userMarker = m;
              } catch (e) {}
            }
          }
        } catch (e) {}

        if (setAsAdding) {
          setAddingPos({ lat, lng });
        }
        setLocating(false);
      },
      (err) => {
        console.error(err);
        alert("Failed to get current location: " + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

    return (
    <div className="rounded-2xl overflow-hidden relative">
      <div ref={mapRef} style={{ height: 480, width: "100%" }} />

      {/* Floating controls - styled to match site */}
      <div style={{ position: "absolute", left: 16, top: 16, zIndex: 1000 }}>
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 flex gap-3 items-center text-sm">
          <button
            className={`px-3 py-1 rounded border text-gray-700`}
            onClick={() => requestCurrentLocation(true)}
            disabled={locating}
          >
            {locating ? "Locating..." : "Add bin at my location"}
          </button>

          <button className="px-2 py-1 border rounded text-sm" onClick={() => requestCurrentLocation(false)} title="Show current location">
            {locating ? "Locating..." : "Show my location"}
          </button>

          {/* filtering is handled by the parent page; MapView just renders the provided bins */}

          {statusMsg && <div className="ml-2 text-xs text-gray-600">{statusMsg}</div>}
        </div>
      </div>

      {/* Add form panel - placed over map bottom and styled */}
      {addingPos && (
        <div className="absolute left-4 right-4 bottom-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4" style={{ zIndex: 2000 }}>
          <h4 className="font-semibold mb-2">Add bin at {addingPos.lat.toFixed(5)}, {addingPos.lng.toFixed(5)}</h4>
          <form onSubmit={handleAddSubmit} className="flex gap-2 flex-wrap items-center">
            <select className="border rounded px-2 py-1" value={addingType} onChange={(e) => setAddingType(e.target.value)}>
              <option value="plastic">Plastic & Metal</option>
              <option value="hartie">Paper</option>
              <option value="sticla">Glass</option>
              <option value="general">Household</option>
            </select>
            <input className="border rounded px-2 py-1 flex-1 min-w-50" placeholder="Name (optional)" value={addingAddr} onChange={(e) => setAddingAddr(e.target.value)} />
            <button className="bg-green-600 text-white px-4 py-1 rounded" disabled={loading}>{loading ? 'Adding...' : 'Add bin'}</button>
            <button type="button" className="px-3 py-1 border rounded" onClick={() => setAddingPos(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}















