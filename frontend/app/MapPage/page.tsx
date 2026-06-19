"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faClock, faHome, faUser, faComments, faTrash, faTrashCan, faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FiGrid } from 'react-icons/fi';
import {useState} from "react";

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
  const [isAddingBin, setIsAddingBin] = useState(false);

  function ShowTrashBins(selectedBin: string) {
    if (selectedBin === "All") {
      // show all bins
    } else if (selectedBin === "Plastic and Metal") {
      // show only plastic and metal bins
    } else if (selectedBin === "Paper") {
      // show only paper bins
    } else if (selectedBin === "Glass") {
      // show only glass bins
    } else if (selectedBin === "Household") {
      // show only household bins
    }
  }

  const binOptions = ["All", "Plastic and Metal", "Paper", "Glass", "Household"];

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
            4 bins found
          </span>
          </div>

          <div className="relative mx-5 mt-5 h-80 overflow-hidden rounded-3xl border border-white/70 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.14)_0,transparent_28%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.18)_0,transparent_30%),linear-gradient(135deg,#e5e7eb_0%,#f8fafc_48%,#d1fae5_100%)] shadow-inner dark:border-gray-700 dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#052e16_100%)]">
            <div className="absolute inset-0 opacity-35 bg-[linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[48px_48px] dark:opacity-20" />

            <button
                type="button"
                onClick={() => setIsAddingBin((value) => !value)}
                className={`absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition-colors ${
                    isAddingBin
                        ? "bg-green-600 text-white shadow-green-600/30 hover:bg-green-700"
                        : "bg-white text-green-700 hover:bg-green-50 dark:bg-gray-900 dark:text-green-300 dark:hover:bg-gray-800"
                }`}
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              {isAddingBin ? "Adding bin" : "Add bin"}
            </button>

            <div className="absolute left-6 top-8 flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-600/25">♻️</div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:bg-gray-900/90 dark:text-gray-200">Recycling</span>
            </div>

            <div className="absolute right-8 top-16 flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25">🧴</div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm dark:bg-gray-900/90 dark:text-gray-200">Plastic</span>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-green-700 text-2xl text-white shadow-lg shadow-green-700/30 dark:border-gray-900">
                📍
              </div>
              <div className="mt-2 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-gray-900/90 dark:text-green-300">
                Your location
              </div>
            </div>
          </div>

          {isAddingBin && (
              <div className="mx-5 mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-100">
                Add-bin mode is active. Click on the map area to place a new bin.
              </div>
          )}

          <div className="grid gap-3 px-5 pb-5 pt-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Nearest bin</p>
              <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">Paper collection point</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">2 min walk • 180m away</p>
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