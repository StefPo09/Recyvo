"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faClock,
  faHome,
  faUser,
  faComments,
  faTrash,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { FiGrid } from 'react-icons/fi';
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { listBins, findNearest, fetchRecyclingPlaces } from "@/lib/api";
import {useRouter} from "next/navigation";

// dynamic import of client-side MapView; typed as any to avoid SSR/type checks
// @ts-ignore
const MapViewAny: any = dynamic(() => import("../../components/MapView"), { ssr: false });

// TopBar is provided by shared component

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
          <FiGrid className="text-2xl text-(--color-text-secondary)" />
      ) : name === "Plastic and Metal" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-amber-500" />
      ) : name === "Paper" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-sky-600" />
      ) : name === "Glass" ? (
          <FontAwesomeIcon icon={faTrash} className="text-2xl text-(--color-green-primary)" />
      ) : (
          <FontAwesomeIcon icon={faTrashCan} className="text-2xl text-(--color-text-primary)" />
      );

  return (
       <button
           onClick={() => onSelect(name)}
           className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
               active
                   ? "border-(--color-green-primary) bg-(--color-green-accent) text-(--color-text-primary) shadow-sm"
                   : "border-(--color-green-accent) bg-(--color-bg-card) text-(--color-text-primary) hover:bg-(--color-green-accent)"
            }`}
        >
       <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-(--color-bg-card)" : "bg-(--color-bg-main)"}`}>
          {icon}
        </span>
         <span className="flex-1 font-medium font-(family-name:--font-header)">{name}</span>
         {active && <span className="text-xs font-semibold text-(--color-green-primary) font-(family-name:--font-body)">Selected</span>}
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
        <div className="rounded-2xl border border-(--color-green-accent) bg-(--color-bg-card) p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-(--color-green-primary)">Map Filters</p>
              <h2 className="text-lg font-semibold text-(--color-text-primary)">Choose the bin category</h2>
            </div>
            <div className="rounded-full bg-(--color-green-accent) px-3 py-1 text-xs font-semibold text-(--color-green-primary)">
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

        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-(--color-bg-card) via-(--color-bg-main) to-(--color-green-accent) shadow-sm ring-1 ring-(--color-green-accent)">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-sm font-medium text-(--color-text-secondary)">Nearby collection points</p>
              <h3 className="text-xl font-bold text-(--color-text-primary)">Live map preview</h3>
            </div>
            <span className="rounded-full bg-(--color-bg-card) px-3 py-1 text-xs font-semibold text-(--color-green-primary) shadow-sm">
              {bins.length + places.length} points found
            </span>
          </div>

          <div className="mt-4">
            <MapViewAny bins={bins} places={places} />
          </div>

          <div className="grid gap-3 px-5 pb-5 pt-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-(--color-bg-card) p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)">Nearest bin</p>
              <p className="mt-1 text-base font-bold text-(--color-text-primary)">{nearest?.nearest_bins?.[0]?.address || '—'}</p>
              <p className="text-sm text-(--color-text-secondary)">{nearest?.nearest_bins?.[0]?.distance_label || ''}</p>
            </div>
            <div className="rounded-2xl bg-(--color-bg-card) p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)">Category</p>
              <p className="mt-1 text-base font-bold text-(--color-text-primary)">{bin}</p>
              <p className="text-sm text-(--color-text-secondary)">Filtered results update here</p>
            </div>
          </div>
        </div>
      </div>
  )
}

function BottomNav() {
  return (
    <div className="shrink-0 border-t border-(--color-green-accent) bg-(--color-bg-card) px-6 py-4">
      <div className="flex justify-around">
      <Link href="../HomePage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faHome} className="text-xl" />
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faClock} className="text-xl" />
        <span className="text-xs font-medium">Scanner</span>
      </Link>
      <button className="flex flex-col items-center gap-1 text-(--color-green-primary)">
        <FontAwesomeIcon icon={faMap} className="text-xl" />
        <span className="text-xs font-medium">Map</span>
      </button>
      <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faComments} className="text-xl" />
        <span className="text-xs font-medium">SEB</span>
      </Link>
      <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faUser} className="text-xl" />
        <span className="text-xs font-medium">Profile</span>
      </Link>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userExists = localStorage.getItem("user");

    if (userExists) {
      try {
        const user = JSON.parse(userExists);
        setUserData(user);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid user data, redirect to StartPage
        router.push("/StartPage");
      }
    } else {
      // No user logged in, redirect to StartPage
      router.push("/StartPage");
    }
    setIsLoading(false);
  }, [router]);
// Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-card)">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-(--color-green-accent) border-t-(--color-green-primary) rounded-full animate-spin"></div>
          <p className="text-(--color-text-secondary) font-(family-name:--font-body)">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (router will handle redirect)
  if (!isAuthenticated) {
    return null;
  }
  return (
      <main className="flex h-screen flex-col overflow-hidden bg-(--color-bg-main)">
        <TopBar
          userData={userData}
        />

        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-(--color-green-primary) font-(family-name:--font-body)">Map</p>
              <h1 className="text-2xl font-bold text-(--color-text-primary) font-(family-name:--font-header)">Recycling bins</h1>
            </div>
            <div className="rounded-full bg-(--color-green-accent) px-3 py-1 text-xs font-semibold text-(--color-green-primary) font-(family-name:--font-body)">
              Nearby bins
            </div>
          </div>
          <BinMap />
        </div>

        <BottomNav />
      </main>
  );
}
