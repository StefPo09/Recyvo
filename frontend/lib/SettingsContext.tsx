"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import { getUserPreferences, saveUserPreferences } from "./api";

const storageKey = "recyvo-settings";

const defaultSettings: {
    toggles: Record<string, boolean>;
    materials: Record<string, boolean>;
    language: string;
    theme: string;
    maxDistance: string;
    distanceUnit: string;
    textSize: string;
} = {
    toggles: {
        "Nearby bins": true,
        "Community challenges": true,
        "SEB updates": false,
        "Location access": true,
        "Camera access": true,
        "Personalized recommendations": true,
        "Share map data": false,
        "Send crash reports": true,
        "Reduce animations": false,
        "High contrast mode": false,
    },
    materials: {
        "Plastic": true,
        "Glass": true,
        "Paper": true,
        "Metal": true,
    },
    language: "English (US)",
    theme: "Dark",
    maxDistance: "1 km",
    distanceUnit: "Kilometers",
    textSize: "Medium",
};

type SettingsState = typeof defaultSettings;

type SettingsContextValue = {
    settings: SettingsState;
    setSettings: (s: SettingsState | ((s: SettingsState) => SettingsState)) => void;
    updateToggle: (label: string, checked: boolean) => void;
    updateMaterial: (label: string, checked: boolean) => void;
    updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
    browserTheme: "Light" | "Dark";
    resolvedTheme: "Light" | "Dark";
    isDark: boolean;
    savedMessage: string;
    setSavedMessage: (m: string) => void;
    debugSettings: () => void;
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (has: boolean) => void;
    savePreferencesManually: () => Promise<boolean>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({
                                     children,
                                     initialTheme,
                                     initialLanguage,
                                 }: {
    children: React.ReactNode;
    initialTheme?: "Light" | "Dark";
    initialLanguage?: string;
}) {
    const [settings, setSettings] = useState<SettingsState>(() => ({
        ...defaultSettings,
        theme: initialTheme ?? defaultSettings.theme,
        language: initialLanguage ?? defaultSettings.language,
    } as SettingsState));
    const [browserTheme, setBrowserTheme] = useState<"Light" | "Dark">("Dark");
    const [savedMessage, setSavedMessage] = useState("Settings saved locally");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // detect browser theme
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const updateBrowserTheme = () => setBrowserTheme(mediaQuery.matches ? "Dark" : "Light");
        updateBrowserTheme();
        mediaQuery.addEventListener("change", updateBrowserTheme);
        return () => mediaQuery.removeEventListener("change", updateBrowserTheme);
    }, []);

    // load saved settings once (from localStorage or backend)
    useEffect(() => {
        // First, try to load from backend if user is logged in
        try {
            // Read stored userId but guard against the literal strings 'undefined' or 'null'
            const rawUserId = typeof window !== 'undefined' ? window.localStorage.getItem("userId") : null;
            const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
            if (userId) {
                // Async load from backend
                getUserPreferences(userId)
                    .then((backendSettings) => {
                        console.debug("Loaded preferences from backend:", backendSettings);
                        // Always merge, even if empty - backend is source of truth for logged-in users
                        if (backendSettings) {
                            setSettings((current) => ({
                                ...current,
                                ...backendSettings,
                                toggles: { ...defaultSettings.toggles, ...(backendSettings.toggles ?? {}) },
                                materials: { ...defaultSettings.materials, ...(backendSettings.materials ?? {}) },
                            }));
                        }
                        // Done loading
                        setIsInitialLoad(false);
                    })
                    .catch((err) => {
                        console.debug("Failed to load preferences from backend, falling back to localStorage", err);
                        // Fall back to localStorage only if backend fails
                        loadFromLocalStorage();
                        setIsInitialLoad(false);
                    });
                return;
            }
        } catch (err) {
            console.debug("Error checking for user, falling back to localStorage", err);
        }
        
        // Fall back to localStorage if no user ID
        loadFromLocalStorage();
        setIsInitialLoad(false);
        
        function loadFromLocalStorage() {
            try {
                const saved = window.localStorage.getItem(storageKey);
                if (!saved) return;
                const parsed = JSON.parse(saved) as Partial<SettingsState>;
                setSettings((current) => ({
                    ...current,
                    ...parsed,
                    toggles: { ...defaultSettings.toggles, ...(parsed.toggles ?? {}) },
                    materials: { ...defaultSettings.materials, ...(parsed.materials ?? {}) },
                }));
            } catch (err) {
                window.localStorage.removeItem(storageKey);
            }
        }
    }, []);

    // persist when settings change (save to both localStorage and backend)
    useEffect(() => {
        // Skip if we're still loading initial settings
        if (isInitialLoad) {
            console.debug("Skipping persist during initial load");
            return;
        }
        
        console.debug("Settings changed, persisting:", settings);
        
        // Mark as having unsaved changes (user changed something)
        setHasUnsavedChanges(true);
        
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(settings));
            setSavedMessage("⚡ Changes made - click Save Preferences to confirm");
        } catch (err) {
            console.error("Failed to save to localStorage:", err);
        }
        
        // Also save to backend if user is logged in
         try {
             const rawUserId = typeof window !== 'undefined' ? window.localStorage.getItem("userId") : null;
             const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
             if (userId) {
                 console.debug("Syncing settings to backend for user:", userId);
                 saveUserPreferences(userId, settings)
                     .then((result) => {
                         console.debug("Settings synced to backend successfully:", result);
                         setSavedMessage("✓ Synced to backend - click Save Preferences to finalize");
                         // Don't set hasUnsavedChanges to false here
                         // Let user manually click Save button
                     })
                     .catch((err) => {
                         // Handle 404 gracefully - user might not exist yet on backend
                         if (err.message && err.message.includes("404")) {
                             console.debug("User not found on backend (404), will retry on next manual save");
                             setSavedMessage("⚡ Changes made - click Save Preferences to confirm");
                         } else {
                             console.error("Failed to sync settings to backend:", err);
                             setSavedMessage("⚠ Sync failed - click Save Preferences to retry");
                         }
                     });
             }
         } catch (err) {
             console.error("Error syncing settings:", err);
         }
    }, [settings, isInitialLoad]);

    const resolvedTheme = settings.theme === "Device" ? browserTheme : (settings.theme as "Light" | "Dark");
    const isDark = resolvedTheme === "Dark";

    // Apply global attributes so theme and language persist at the root HTML element.
    // This makes sure Tailwind's `dark` class and the document `lang` reflect saved settings.
    useEffect(() => {
        try {
            // set html lang (map human-readable option to a short code)
            const mapLang = (label: string) => {
                if (label.includes("Romanian")) return "ro";
                if (label.includes("German")) return "de";
                if (label.includes("French")) return "fr";
                if (label.includes("Spanish")) return "es";
                return "en"; // default
            };

            document.documentElement.lang = mapLang(settings.language);

            // set dark mode class on root element so global CSS/tailwind respects it
            if (isDark) {
                document.documentElement.classList.add("dark");
                document.documentElement.setAttribute("data-theme", "Dark");
            } else {
                document.documentElement.classList.remove("dark");
                document.documentElement.setAttribute("data-theme", "Light");
            }
        } catch (err) {
            // ignore in non-browser environments
        }
    }, [settings.language, isDark]);

    // Persist theme and language to cookies so SSR/layout can read them for initial render
    useEffect(() => {
        try {
            const mapLang = (label: string) => {
                if (label.includes("Romanian")) return "ro";
                if (label.includes("German")) return "de";
                if (label.includes("French")) return "fr";
                if (label.includes("Spanish")) return "es";
                return "en";
            };

            const langCode = mapLang(settings.language);
            // set cookies for one year
            document.cookie = `recyvo-theme=${settings.theme}; path=/; max-age=${60 * 60 * 24 * 365}`;
            document.cookie = `recyvo-lang=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}`;
        } catch (err) {
            // ignore
        }
    }, [settings.theme, settings.language]);

    function updateToggle(label: string, checked: boolean) {
        console.debug("SettingsContext: updateToggle", label, checked);
        setSettings((current) => {
            const newSettings = {
                ...current,
                toggles: {
                    ...(current as any).toggles,
                    [label]: checked,
                },
            };
            console.debug("New settings after toggle:", newSettings);
            return newSettings;
        });
    }

    function updateMaterial(label: string, checked: boolean) {
        console.debug("SettingsContext: updateMaterial", label, checked);
        setSettings((current) => {
            const newSettings = {
                ...current,
                materials: {
                    ...(current as any).materials,
                    [label]: checked,
                },
            };
            console.debug("New settings after material update:", newSettings);
            return newSettings;
        });
    }

    function updateSetting<Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) {
        console.debug("SettingsContext: updateSetting", key, value);
        setSettings((current) => {
            const newSettings = {
                ...current,
                [key]: value,
            };
            console.debug("New settings after update:", newSettings);
            return newSettings;
        });
    }

    // Manual save function that returns a promise
     async function savePreferencesManually(): Promise<boolean> {
         console.debug("Manual save triggered");

         // Save to localStorage
         try {
             window.localStorage.setItem(storageKey, JSON.stringify(settings));
         } catch (err) {
             console.error("Failed to save to localStorage:", err);
             return false;
         }

         // Save to backend
         try {
             const rawUserId = typeof window !== 'undefined' ? window.localStorage.getItem("userId") : null;
             const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
             if (userId) {
                 try {
                     await saveUserPreferences(userId, settings);
                     console.debug("Manual save to backend successful");
                     setSavedMessage("✓ All preferences saved successfully!");
                     setHasUnsavedChanges(false);
                     return true;
                 } catch (backendErr) {
                     // Handle 404 gracefully - user might not exist on backend yet
                     if (backendErr instanceof Error && backendErr.message.includes("404")) {
                         console.debug("User not found on backend (404) - saving to localStorage only");
                         setSavedMessage("✓ Preferences saved locally (user not synced to backend)");
                         setHasUnsavedChanges(false);
                         return true;
                     } else {
                         throw backendErr;
                     }
                 }
             } else {
                 setSavedMessage("✓ Preferences saved locally");
                 setHasUnsavedChanges(false);
                 return true;
             }
         } catch (err) {
             console.error("Failed to manually save to backend:", err);
             setSavedMessage("Error saving - please try again");
             return false;
         }
     }

    const value = useMemo(
        () => ({
            settings,
            setSettings,
            updateToggle,
            updateMaterial,
            updateSetting,
            browserTheme,
            resolvedTheme,
            isDark,
            savedMessage,
            setSavedMessage,
            hasUnsavedChanges,
            setHasUnsavedChanges,
            savePreferencesManually,
            // Debug function to check saved state
            debugSettings: () => {
                console.log("=== SETTINGS DEBUG ===");
                console.log("Initial load phase:", isInitialLoad);
                console.log("Current settings in memory:", settings);
                try {
                    const stored = window.localStorage.getItem(storageKey);
                    console.log("Settings in localStorage:", stored ? JSON.parse(stored) : "empty");
                } catch (e) {
                    console.error("Error reading localStorage:", e);
                }
                const rawUserId = window.localStorage.getItem("userId");
                const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? rawUserId : null;
                console.log("Current userId:", userId);
                console.log("Saved message:", savedMessage);
                console.log("Has unsaved changes:", hasUnsavedChanges);
                console.log("=== END DEBUG ===");
            }
        }),
        [settings, browserTheme, resolvedTheme, isDark, savedMessage, hasUnsavedChanges, isInitialLoad],
    );

    const mainClassName = useMemo(() => {
        const textSizeClass =
            settings.textSize === "Small"
                ? "text-sm"
                : settings.textSize === "Large"
                    ? "text-lg"
                    : "text-base";
        const themeClass = resolvedTheme === "Light" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-white";
        const contrastClass = (settings as any).toggles?.["High contrast mode"] ? "contrast-125" : "";

        return `min-h-screen ${themeClass} ${textSizeClass} ${contrastClass}`;
    }, [resolvedTheme, settings.textSize, (settings as any).toggles]);

    return (
        <SettingsContext.Provider value={value}>
            <div className={mainClassName}>{children}</div>
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}

export default SettingsProvider;