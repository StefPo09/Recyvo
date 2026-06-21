"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClock,
  faComments,
  faEye,
  faEyeSlash,
  faCamera,
  faHome,
  faMap,
  faPenToSquare,
  faRightFromBracket,
  faUser,
  faUserCircle,
  faXmark,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {useEffect, useState, useRef, type ReactNode} from "react";
import Link from "next/link";
import { getUserById, updateUser, uploadProfileImage } from "@/lib/api";

type ProfileData = {
  username: string;
  fullName: string;
  email: string;
  profileImage: string | null;
};

const initialProfile: ProfileData = {
  username: "GigelGigica",
  fullName: "Popa Stefan",
  email: "example@gmail.com",
  profileImage: null,
};

function TopHeader() {
  return (
    <div className="bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">
            🤖
          </div>
          <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
        </div>
        <Link
          href="../SettingsPage"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
          aria-label="Settings"
        >
          <FontAwesomeIcon icon={faUserGear} className="text-sm" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="bg-(--color-bg-card) rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-(--color-text-secondary) text-sm font-medium font-(family-name:--font-body)">Eco Legend in Training</p>
            <p className="text-2xl font-bold text-(--color-text-primary) mt-1 font-(family-name:--font-header)">Karma Points: <span className="text-(--color-green-primary)">12,450</span></p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🏅</span>
            <span className="text-xs text-(--color-text-secondary) mt-1">Level 7</span>
          </div>
        </div>

        <div className="w-full bg-(--color-green-accent) rounded-full h-2">
          <div className="bg-(--color-green-primary) h-2 rounded-full" style={{ width: "70%" }}></div>
        </div>
      </div>
    </div>
  );
}

function ProfileAvatar({ image, isEditing, onImageChange }: { image: string | null; isEditing: boolean; onImageChange: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto h-32 w-32">
      <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-200 bg-linear-to-br from-emerald-400 to-emerald-600 shadow-lg dark:border-emerald-300 ${isEditing ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`} onClick={() => isEditing && fileInputRef.current?.click()}>
        {image ? (
          <img src={image} alt="Profile" className="h-28 w-28 rounded-full object-cover" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-6xl text-emerald-600">
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
        )}
      </div>
      {isEditing && (
        <div className="absolute inset-0 flex h-32 w-32 items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <FontAwesomeIcon icon={faCamera} className="text-white text-2xl" />
        </div>
      )}
      {isEditing && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImageChange(file);
          }}
          className="hidden"
        />
      )}
    </div>
  );
}

function ProfileField({
  label,
  value,
  isEditing,
  onChange,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (nextValue: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = label === "Password";
  const inputType = isPasswordField && !showPassword ? "password" : "text";

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-emerald-500">{label}</label>
      {isEditing ? (
        <div className="relative">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type={inputType}
            className="w-full rounded-xl border-2 border-emerald-500 bg-emerald-100 px-4 py-3 text-center text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-lg" />
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-base font-medium text-emerald-100 transition-colors">
          {value}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: "danger" | "success" | "primary";
}) {
  const styles =
    variant === "danger"
      ? "bg-linear-to-r from-red-500 to-red-600 text-white shadow-red-500/20"
      : "bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-green-500/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 ${styles}`}
    >
      {children}
    </button>
  );
}

function BottomNav() {
  return (
    <div className="mt-auto border-t border-(--color-green-accent) bg-(--color-bg-card) px-6 py-4 flex justify-around">
      <Link href="../HomePage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faHome} className="text-xl" />
        <span className="text-xs font-medium font-(family-name:--font-body)">Home</span>
      </Link>
      <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faClock} className="text-xl" />
        <span className="text-xs font-medium font-(family-name:--font-body)">Scanner</span>
      </Link>
      <Link href="../MapPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faMap} className="text-xl" />
        <span className="text-xs font-medium font-(family-name:--font-body)">Map</span>
      </Link>
      <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faComments} className="text-xl" />
        <span className="text-xs font-medium font-(family-name:--font-body)">SEB</span>
      </Link>
      <button className="flex flex-col items-center gap-1 text-(--color-green-primary)">
        <FontAwesomeIcon icon={faUser} className="text-xl" />
        <span className="text-xs font-medium font-(family-name:--font-body)">Profile</span>
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(initialProfile);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/StartPage");
      return;
    }

    (async () => {
      try {
        const resp = await getUserById(userId);
        setSavedProfile((current) => ({
          ...current,
          username: resp.username || current.username,
          fullName: resp.nume || current.fullName,
          email: resp.email || current.email,
          profileImage: resp.profile_image || current.profileImage,
        }));
        setDraftProfile((current) => ({
          ...current,
          username: resp.username || current.username,
          fullName: resp.nume || current.fullName,
          email: resp.email || current.email,
          profileImage: resp.profile_image || current.profileImage,
        }));
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.push("/StartPage");
      }
    })();
  }, [router]);

  const profile = isEditing ? draftProfile : savedProfile;

  function startEditing() {
    setDraftProfile(savedProfile);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftProfile(savedProfile);
    setIsEditing(false);
  }

  function saveEditing() {
    // persist changes to backend
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Not authenticated");
      return;
    }

    (async () => {
      try {
        const resp = await updateUser(userId, {
          username: draftProfile.username,
          nume: draftProfile.fullName,
          email: draftProfile.email,
        });

        const updatedProfile = {
          username: resp.username,
          fullName: resp.nume,
          email: resp.email,
          profileImage: resp.profile_image || savedProfile.profileImage,
        };

        setSavedProfile(updatedProfile);
        setIsEditing(false);

        // update localStorage user data for other parts of the app
        try {
          const existing = localStorage.getItem("user");
          if (existing) {
            const parsed = JSON.parse(existing);
            const merged = { ...parsed, ...resp };
            localStorage.setItem("user", JSON.stringify(merged));
          } else {
            localStorage.setItem("user", JSON.stringify(resp));
          }
        } catch (e) {
          // ignore localStorage errors
        }
      } catch (err: any) {
        console.error("Failed to update profile:", err);
        alert(err.message || "Failed to update profile.");
      }
    })();
  }

  function handleImageChange(file: File) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Not authenticated");
      return;
    }

    (async () => {
      try {
        const resp = await uploadProfileImage(userId, file);
        const imageUrl = resp.profile_image || resp.profileImage || null;
        setDraftProfile((current) => ({ ...current, profileImage: imageUrl }));
      } catch (err: any) {
        console.error("Upload profile image failed:", err);
        alert("Failed to upload profile image.");
      }
    })();
  }

  function handleDeleteAccount() {
    const ok = confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!ok) return;
    // Actually delete account from backend
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Error: User ID not found.");
      return;
    }

    (async () => {
      try {
        // Dynamic import to avoid static TS resolution issues in some dev setups
        const mod = await import("../../lib/api");
        // access as any to avoid editor/typecheck complaining in some environments
        const deleteFn = (mod as any).deleteUser as (id: string) => Promise<any>;
        if (typeof deleteFn !== "function") {
          // avoid throwing inside the same try/catch (ESLint warning) — show user-friendly message instead
          alert("Delete function not available. Please try again later.");
          return;
        }

        await deleteFn(userId);
        // Clear all auth data from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        // Redirect to StartPage
        router.push("/StartPage");
      } catch (err: any) {
        console.error("Failed to delete account:", err);
        alert(err.message || "Failed to delete account. Please try again.");
      }
    })();
  }

  return (
    <main className="flex h-screen flex-col bg-(--color-bg-main)">
      <div className="flex h-full w-full flex-col bg-(--color-bg-card) text-(--color-text-primary) shadow-2xl">
        <TopHeader />

        <section className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-4xl bg-(--color-bg-card) px-4 pb-6 pt-2">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-(--color-green-primary) font-(family-name:--font-header)">
                <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
                <h2 className="text-4xl font-black tracking-tight">My Profile</h2>
              </div>

              <ProfileAvatar image={profile.profileImage} isEditing={isEditing} onImageChange={handleImageChange} />

              <p className="mt-5 text-2xl font-bold text-(--color-text-primary) font-(family-name:--font-header)">{profile.fullName}</p>
              <p className="mt-3 text-sm font-semibold text-(--color-text-secondary) font-(family-name:--font-body)">{profile.email}</p>

              <div className="mt-6 flex justify-center gap-3">
                {isEditing ? (
                  <>
                    <ActionButton variant="danger" onClick={cancelEditing}>
                      <FontAwesomeIcon icon={faXmark} />
                      Cancel
                    </ActionButton>
                    <ActionButton variant="success" onClick={saveEditing}>
                      <FontAwesomeIcon icon={faCheck} />
                      Save
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton variant="primary" onClick={startEditing}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Edit Profile
                  </ActionButton>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="mb-4 flex justify-center items-center gap-3 text-2xl font-black text-(--color-green-primary) font-(family-name:--font-header)">
                <span>📋</span>
                <h3>Personal Information</h3>
              </div>

              <div className="mx-auto max-w-md space-y-3">
                <ProfileField
                  label="Username"
                  value={profile.username}
                  isEditing={isEditing}
                  onChange={(nextValue) =>
                    isEditing
                      ? setDraftProfile((current) => ({ ...current, username: nextValue }))
                      : setSavedProfile((current) => ({ ...current, username: nextValue }))
                  }
                />
                <ProfileField
                  label="Full Name"
                  value={profile.fullName}
                  isEditing={isEditing}
                  onChange={(nextValue) =>
                    isEditing
                      ? setDraftProfile((current) => ({ ...current, fullName: nextValue }))
                      : setSavedProfile((current) => ({ ...current, fullName: nextValue }))
                  }
                />
                <ProfileField
                  label="Email"
                  value={profile.email}
                  isEditing={isEditing}
                  onChange={(nextValue) =>
                    isEditing
                      ? setDraftProfile((current) => ({ ...current, email: nextValue }))
                      : setSavedProfile((current) => ({ ...current, email: nextValue }))
                  }
                />
              </div>
            </div>

            {isEditing && (
              <div className="mt-10">
                <Link
                  href="../StartPage"
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-red-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-red-700"
                  style={{ fontFamily: 'var(--font-header)' }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Logout
                </Link>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-red-600 bg-transparent px-6 py-4 text-base font-bold text-red-500 shadow-sm transition-colors hover:bg-red-600 hover:text-white"
                    style={{ fontFamily: 'var(--font-header)' }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <BottomNav />
      </div>
    </main>
  );
}
