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
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import {useRouter} from "next/navigation";
import {useEffect, useState, useRef, type ReactNode} from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { deleteUser, updateUser, uploadProfileImage } from "@/lib/api";

type UserData = {
  id?: string;
  username?: string;
  nume?: string;
  email?: string;
  profile_image?: string | null;
  nr_puncte?: number;
};

type UserApiResponse = {
  id?: string;
  username: string;
  nume: string;
  email: string;
  profile_image?: string | null;
  profileImage?: string | null;
  nr_puncte?: number;
};

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

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function profileFromUser(user: UserData): ProfileData {
  return {
    username: user.username || initialProfile.username,
    fullName: user.nume || initialProfile.fullName,
    email: user.email || initialProfile.email,
    profileImage: user.profile_image ?? initialProfile.profileImage,
  };
}

// TopBar provided by shared component

function ProfileAvatar({ image, isEditing, onImageChange }: { image: string | null; isEditing: boolean; onImageChange: (file: File) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto h-32 w-32">
      <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-(--color-green-accent) bg-linear-to-br from-(--color-green-primary) to-(--color-green-primary) shadow-lg ${isEditing ? "cursor-pointer transition-opacity hover:opacity-80" : ""}`} onClick={() => isEditing && fileInputRef.current?.click()}>
        {image ? (
          <img src={image} alt="Profile" className="h-28 w-28 rounded-full object-cover" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-(--color-bg-card) text-6xl text-(--color-green-primary)">
            <FontAwesomeIcon icon={faUserCircle} />
          </div>
        )}
      </div>
      {isEditing && (
        <div className="pointer-events-none absolute inset-0 flex h-32 w-32 items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity hover:opacity-100">
          <FontAwesomeIcon icon={faCamera} className="text-2xl text-white" />
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
      <label className="text-sm font-semibold text-(--color-green-primary)">{label}</label>
      {isEditing ? (
        <div className="relative">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            type={inputType}
            className="w-full rounded-xl border-2 border-(--color-green-primary) bg-(--color-bg-main) px-4 py-3 text-center text-base font-medium text-(--color-text-primary) outline-none transition-all placeholder:text-(--color-text-secondary) focus:ring-2 focus:ring-(--color-green-primary)/30"
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="text-lg" />
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-(--color-green-accent) bg-(--color-bg-main) px-4 py-3 text-base font-medium text-(--color-text-primary) transition-colors">
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
      : "bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) shadow-green-500/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 ${styles}`}
    >
      {children}
    </button>
  );
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
      <Link href="../MapPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faMap} className="text-xl" />
        <span className="text-xs font-medium">Map</span>
      </Link>
      <Link href="../AiChatPage" className="flex flex-col items-center gap-1 text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
        <FontAwesomeIcon icon={faComments} className="text-xl" />
        <span className="text-xs font-medium">SEB</span>
      </Link>
      <button className="flex flex-col items-center gap-1 text-(--color-green-primary)">
        <FontAwesomeIcon icon={faUser} className="text-xl" />
        <span className="text-xs font-medium">Profile</span>
      </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [savedProfile, setSavedProfile] = useState<ProfileData>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(initialProfile);

  useEffect(() => {
    // Check if user is logged in
    const userExists = localStorage.getItem("user");

    if (userExists) {
      try {
        const user = JSON.parse(userExists) as UserData;
        setUserData(user);
        const userProfile = profileFromUser(user);
        setSavedProfile(userProfile);
        setDraftProfile(userProfile);
        setIsAuthenticated(true);
      } catch {
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
        }) as UserApiResponse;

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
            const parsed = JSON.parse(existing) as UserData;
            const merged = { ...parsed, ...resp };
            localStorage.setItem("user", JSON.stringify(merged));
            setUserData(merged);
          } else {
            localStorage.setItem("user", JSON.stringify(resp));
            setUserData(resp);
          }
        } catch {
          // ignore localStorage errors
        }
      } catch (err: unknown) {
        console.error("Failed to update profile:", err);
        alert(getErrorMessage(err) || "Failed to update profile.");
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
        const resp = await uploadProfileImage(userId, file) as UserApiResponse;
        const imageUrl = resp.profile_image || resp.profileImage || null;
        setDraftProfile((current) => ({ ...current, profileImage: imageUrl }));
      } catch (err: unknown) {
        console.error("Upload profile image failed:", err);
        alert("Failed to upload profile image.");
      }
    })();
  }

  function logout() {
    // Clear auth state, but keep app preferences so guest pages keep the chosen theme.
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("user");
    document.cookie = "recyvo-theme=; path=/; max-age=0";
    window.dispatchEvent(new Event("recyvo-auth-changed"));
    // Redirect to StartPage
    window.location.href = "/StartPage";
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
        await deleteUser(userId);
        // Clear all auth data from localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        // Redirect to StartPage
        router.push("/StartPage");
      } catch (err: unknown) {
        console.error("Failed to delete account:", err);
        alert(getErrorMessage(err) || "Failed to delete account. Please try again.");
      }
    })();
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-(--color-bg-main)">
      <div className="flex flex-1 min-h-0 w-full flex-col bg-(--color-bg-card) text-(--color-text-primary) shadow-2xl">
        <TopBar
          userData={userData}
        />

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-4xl bg-(--color-bg-card) px-4 pb-6 pt-2">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-(--color-green-primary) font-(family-name:--font-header)">
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
                <button
                  onClick={logout}
                  className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-full bg-red-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-red-700"
                  style={{ fontFamily: 'var(--font-header)' }}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Logout
                </button>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-full border-2 border-red-600 bg-transparent px-6 py-4 text-base font-bold text-red-500 shadow-sm transition-colors hover:bg-red-600 hover:text-white"
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
