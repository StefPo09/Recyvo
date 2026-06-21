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
      if (leafletMapRef.current) {
        console.log("Map already initialized, skipping re-initialization");
        return;
      }

      console.log("Initializing Leaflet map...");
      const map = L.map(mapRef.current).setView([44.439663, 26.096306], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      leafletMapRef.current = map;
      console.log("Leaflet map initialized successfully");

      // Force map to recalculate bounds and eliminate the partial/square map loading glitch
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    // Inject CSS if it doesn't exist yet
    const linkId = "leaflet-cdn-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      console.log("Leaflet already available, initializing map immediately");
      initLeaflet();
    } else {
      console.log("Leaflet not available, loading from CDN...");
      const scriptId = "leaflet-cdn-script";
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!existing) {
        console.log("Creating new Leaflet script element");
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.async = true;
        s.onload = () => {
          console.log("Leaflet script loaded from CDN");
          // Small delay to ensure window.L is available
          setTimeout(() => initLeaflet(), 0);
        };
        s.onerror = () => console.error("Failed to load Leaflet script from CDN");
        document.body.appendChild(s);
      } else {
        console.log("Leaflet script element already exists");
        if ((window as any).L) {
          console.log("Leaflet already loaded, initializing map");
          initLeaflet();
        } else {
          console.log("Waiting for Leaflet script to load...");
          const handleLoad = () => {
            console.log("Leaflet script finished loading (via cached script load event)");
            setTimeout(() => initLeaflet(), 0);
            existing.removeEventListener("load", handleLoad);
          };
          existing.addEventListener("load", handleLoad);
        }
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapRef]);

  // render markers when bins, places or current location change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    // clear existing - Added try/catch blocks for robust cleanup
    let markersRemovedCount: number = 0;
    if ((map as any)._customMarkers) {
      (map as any)._customMarkers.forEach((m: any) => {
        try {
          m.remove();
          markersRemovedCount++;
        } catch (e) {
          console.warn("Failed to remove custom bin marker:", e);
        }
      });
    }

    let placesRemovedCount: number = 0;
    if ((map as any)._customPlaces) {
      (map as any)._customPlaces.forEach((m: any) => {
        try {
          m.remove();
          placesRemovedCount++;
        } catch (e) {
          console.warn("Failed to remove custom place marker:", e);
        }
      });
    }

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
        const googleMapsUrl = `http://googleusercontent.com/maps.google.com/${b.lat},${b.lng}`;
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
      } catch (e) {
        console.error("Error rendering bin marker:", e);
      }
    });
    (map as any)._customMarkers = created;

    const createdPlaces: any[] = [];
    places.forEach((p) => {
      try {
        const marker = L.circleMarker([p.latitude, p.longitude], { radius: 7, color: "#1e3a8a" }).addTo(map);
        const googleMapsUrl = `http://googleusercontent.com/maps.google.com/${p.latitude},${p.longitude}`;
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
      } catch (e) {
        console.error("Error rendering place marker:", e);
      }
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
        locMarker.bindPopup(`<div class="text-sm">You are here</div>`);
        (map as any)._currentLocationMarker = locMarker;
      } catch (e) {}
    }
  }, [bins, places, currentLocation]);

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addingPos) return;
    setLoading(true);
    try {
      await addBin({ lat: addingPos.lat, lng: addingPos.lng, address: addingAddr, bin_type: addingType });
      console.log('Added bin at', addingPos);
      setStatusMsg(`Added bin at ${addingPos.lat.toFixed(5)}, ${addingPos.lng.toFixed(5)}`);
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
          try {
            const map = leafletMapRef.current;
            if (map && (window as any).L) {
              map.setView([lat, lng], 14);
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
      <div className="rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-zinc-900">
        <div ref={mapRef} style={{ height: 480, width: "100%", background: "#f3f4f6" }} />

        {/* Floating controls */}
        <div style={{ position: "absolute", left: 16, top: 16, zIndex: 1000 }}>
          <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 flex gap-3 items-center text-sm">
            <button
                className="px-3 py-1 rounded border text-gray-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => requestCurrentLocation(true)}
                disabled={locating}
            >
              {locating ? "Locating..." : "Add bin at my location"}
            </button>

            <button
                className="px-2 py-1 border rounded text-sm border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                onClick={() => requestCurrentLocation(false)}
                title="Show current location"
            >
              {locating ? "Locating..." : "Show my location"}
            </button>

            {statusMsg && <div className="ml-2 text-xs text-gray-600 dark:text-gray-400">{statusMsg}</div>}
          </div>
        </div>

        {/* Add form panel */}
        {addingPos && (
            <div className="absolute left-4 right-4 bottom-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-4" style={{ zIndex: 2000 }}>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Add bin at {addingPos.lat.toFixed(5)}, {addingPos.lng.toFixed(5)}</h4>
              <form onSubmit={handleAddSubmit} className="flex gap-2 flex-wrap items-center">
                <select
                    className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                    value={addingType}
                    onChange={(e) => setAddingType(e.target.value)}
                >
                  <option value="plastic">Plastic & Metal</option>
                  <option value="hartie">Paper</option>
                  <option value="sticla">Glass</option>
                  <option value="general">Household</option>
                </select>
                <input
                    className="border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 flex-1 min-w-50 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Name (optional)"
                    value={addingAddr}
                    onChange={(e) => setAddingAddr(e.target.value)}
                />
                <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition-colors"
                    disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add bin'}
                </button>
                <button
                    type="button"
                    className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => setAddingPos(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
        )}
      </div>
  );
}