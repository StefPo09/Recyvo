"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

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
  toggles: {},
  materials: {},
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

  // detect browser theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateBrowserTheme = () => setBrowserTheme(mediaQuery.matches ? "Dark" : "Light");
    updateBrowserTheme();
    mediaQuery.addEventListener("change", updateBrowserTheme);
    return () => mediaQuery.removeEventListener("change", updateBrowserTheme);
  }, []);

  // load saved settings once
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<SettingsState>;
      setSettings((current) => ({
        ...current,
        ...parsed,
        toggles: { ...(current as any).toggles, ...(parsed.toggles ?? {}) },
        materials: { ...(current as any).materials, ...(parsed.materials ?? {}) },
      }));
    } catch (err) {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  // persist when settings change
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
      setSavedMessage("Settings saved locally");
    } catch (err) {
      // ignore
    }
  }, [settings]);

  const resolvedTheme = settings.theme === "Device" ? browserTheme : (settings.theme as "Light" | "Dark");
  const isDark = resolvedTheme === "Dark";

  // Apply global attributes so theme and language persist at the root HTML element.
  // This makes sure Tailwind's `dark` class and the document `lang` reflect saved settings.
  React.useEffect(() => {
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
    setSettings((current) => ({
      ...current,
      toggles: {
        ...(current as any).toggles,
        [label]: checked,
      },
    }));
  }

  function updateMaterial(label: string, checked: boolean) {
    setSettings((current) => ({
      ...current,
      materials: {
        ...(current as any).materials,
        [label]: checked,
      },
    }));
  }

  function updateSetting<Key extends keyof SettingsState>(key: Key, value: SettingsState[Key]) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
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
    }),
    [settings, browserTheme, resolvedTheme, isDark, savedMessage],
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




