"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faClock, faHome, faUser, faComments, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FiGrid } from 'react-icons/fi';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { listBins, findNearest, fetchRecyclingPlaces } from "@/lib/api";

// dynamic import of client-side MapView; typed as any to avoid SSR/type checks
// @ts-ignore
const MapViewAny: any = dynamic(() => import("../../components/MapView"), { ssr: false });

function BinSelect({
                     name,
                     active,
                     onSelect,
                   }: {
  name: string;
  active: boolean;
  onSelect: (name: string) => void;
}) {
  const icon =
      name === "All" ? (
          <FiGrid className="text-2xl text-gray-600" />
      ) : name === "Plastic and Metal" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-yellow-400" />
      ) : name === "Paper" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-blue-600" />
      ) : name === "Glass" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-emerald-600" />
      ) : (
          <FontAwesomeIcon icon={faTrashCan} className="text-2xl text-gray-700 dark:text-gray-200" />
      );

  return (
      <button
          onClick={() => onSelect(name)}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
              active
                  ? "border-green-600 bg-green-50 text-green-900 shadow-sm dark:border-green-500 dark:bg-green-950/40 dark:text-green-100"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          }`}
      >
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-green-100 dark:bg-green-900/60" : "bg-gray-100 dark:bg-gray-800"}`}>
        {icon}
      </span>
        <span className="flex-1 font-medium">{name}</span>
        {active && <span className="text-xs font-semibold text-green-600 dark:text-green-300">Selected</span>}
      </button>
  );
}

function BinMap() {
  const [bin, setBin] = useState("All");
  const [bins, setBins] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [nearest, setNearest] = useState<any | null>(null);

  async function ShowTrashBins(selectedBin: string) {
    // map UI category to backend bin_type and place category
    const map = (name: string) => {
      if (name === "Plastic and Metal") return { binType: "plastic", placeCat: "plastic" };
      if (name === "Paper") return { binType: "hartie", placeCat: "hartie_carton" };
      if (name === "Glass") return { binType: "sticla", placeCat: "sticla" };
      if (name === "Household") return { binType: "general", placeCat: "altele" };
      return { binType: undefined, placeCat: "altele" };
    };

    const mapping = map(selectedBin);

    try {
      const b = await listBins(mapping.binType);
      setBins(b || []);
    } catch (e) {
      // ignore
    }

    // update places for current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const p = await fetchRecyclingPlaces(pos.coords.latitude, pos.coords.longitude, mapping.placeCat, 8);
          setPlaces(p || []);
        } catch (err) {
          // ignore
        }
      });
    }
  }

  const binOptions = ["All", "Plastic and Metal", "Paper", "Glass", "Household"];

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const all = await listBins();
        if (!mounted) return;
        setBins(all || []);
      } catch (e) {
        // ignore
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
            const catToBin = (name: string) => {
              if (name === "Plastic and Metal") return { binType: "plastic", placeCat: "plastic" };
              if (name === "Paper") return { binType: "hartie", placeCat: "hartie_carton" };
              if (name === "Glass") return { binType: "sticla", placeCat: "sticla" };
              if (name === "Household") return { binType: "general", placeCat: "altele" };
              return { binType: "general", placeCat: "altele" };
            };

            const mapping = catToBin(bin);

            try {
              const near = await findNearest(pos.coords.latitude, pos.coords.longitude, mapping.binType, 5);
              if (mounted) setNearest(near);
            } catch (e) {
              // ignore
            }

            try {
              const p = await fetchRecyclingPlaces(pos.coords.latitude, pos.coords.longitude, mapping.placeCat, 8);
              if (!mounted) return;
              setPlaces(p || []);
            } catch (e) {
              // ignore
            }
          } catch (e) {
            // ignore
          }
        });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [bin]);

  return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Map Filters</p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Choose the bin category</h2>
            </div>
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-200">
              {bin}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {binOptions.map((name) => (
                <BinSelect
                    key={name}
                    name={name}
                    active={bin === name}
                    onSelect={(selectedBin) => {
                      setBin(selectedBin);
                      ShowTrashBins(selectedBin);
                    }}
                />
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-green-50 via-white to-emerald-50 shadow-sm ring-1 ring-green-100 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/30 dark:ring-gray-800">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nearby collection points</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live map preview</h3>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-300">
              {bins.length + places.length} points found
            </span>
          </div>

          <div className="mt-4">
            <MapViewAny bins={bins} places={places} />
          </div>

          <div className="grid gap-3 px-5 pb-5 pt-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Nearest bin</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{nearest?.nearest_bins?.[0]?.address || '—'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{nearest?.nearest_bins?.[0]?.distance_label || ''}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{bin}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Filtered results update here</p>
            </div>
          </div>
        </div>
      </div>
  )
}

export default function Home() {
  return (
      <main className="flex min-h-screen flex-col bg-white dark:bg-black">
        <div className="bg-linear-to-r from-green-700 to-green-600 text-white px-6 pt-6 pb-8 rounded-b-3xl dark:from-green-900 dark:to-green-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
              🤖
            </div>
            <h1 className="text-lg font-semibold">SEB: Eco Assistant</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Eco Legend in Training</p>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">Points: <span className="text-green-700">12,450</span></p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">🏅</span>
                <span className="text-xs text-gray-500 mt-1">Level 7</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: "70%" }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Map</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recycling bins</h1>
            </div>
            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-200">
              Nearby bins
            </div>
          </div>
          <BinMap />
        </div>

        <div className="mt-auto border-t border-gray-200 bg-white px-6 py-4 flex justify-around dark:border-gray-700 dark:bg-black">
          <Link href="../HomePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faHome} className="text-xl" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faClock} className="text-xl" />
            <span className="text-xs font-medium">Scanner</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-green-700">
            <FontAwesomeIcon icon={faMap} className="text-xl" />
            <span className="text-xs font-medium">Map</span>
          </button>
          <Link href="../CommunityPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faComments} className="text-xl" />
            <span className="text-xs font-medium">Community</span>
          </Link>
          <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faUser} className="text-xl" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </main>
  );
}