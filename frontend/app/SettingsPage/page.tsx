import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faArrowsRotate,
  faCamera,
  faChevronRight,
  faCircleHalfStroke,
  faCircleQuestion,
  faCodeBranch,
  faDesktop,
  faDownload,
  faFileContract,
  faGlobe,
  faHeadset,
  faHome,
  faLocationDot,
  faMoon,
  faPalette,
  faRecycle,
  faRobot,
  faRoute,
  faShieldHalved,
  faSignOutAlt,
  faSun,
  faTextHeight,
  faTrophy,
  faUniversalAccess,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const notificationSettings = [
  {
    label: "Nearby bins",
    description: "Get an alert when useful recycling points are close.",
    checked: true,
  },
  {
    label: "Community challenges",
    description: "Hear about new team goals and weekly eco missions.",
    checked: true,
  },
  {
    label: "SEB updates",
    description: "Receive product tips and assistant improvements.",
    checked: false,
  },
];

const privacySettings = [
  {
    label: "Location access",
    description: "Use your position to find nearby recycling bins.",
    checked: true,
    icon: faLocationDot,
  },
  {
    label: "Camera access",
    description: "Allow scanning waste items and packaging labels.",
    checked: true,
    icon: faCamera,
  },
  {
    label: "Personalized recommendations",
    description: "Adapt challenges and tips based on your recycling activity.",
    checked: true,
    icon: faRecycle,
  },
];

const recyclingMaterials = ["Plastic", "Glass", "Paper", "Metal"];

const securitySettings = [
  {
    label: "Share map data",
    description: "Help improve bin availability and routes around you.",
    checked: false,
  },
  {
    label: "Send crash reports",
    description: "Send diagnostics so the app can be fixed faster.",
    checked: true,
  },
];

const accessibilitySettings = [
  {
    label: "Reduce animations",
    description: "Use calmer transitions across the app.",
    checked: false,
  },
  {
    label: "High contrast mode",
    description: "Increase contrast for text, controls, and map details.",
    checked: false,
  },
];

const supportActions = [
  { label: "Contact SEB", icon: faHeadset },
  { label: "FAQ", icon: faCircleQuestion },
  { label: "Terms & Conditions", icon: faFileContract },
  { label: "Privacy Policy", icon: faShieldHalved },
];

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[var(--color-bg-card)] rounded-xl p-4 shadow border border-[var(--color-green-accent)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold font-[family-name:var(--font-header)] text-[var(--color-text-primary)]">{title}</h2>
        {description ? (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-[family-name:var(--font-body)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  icon,
}: {
  label: string;
  description: string;
  checked?: boolean;
  icon?: IconDefinition;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg bg-[var(--color-bg-main)] px-3 py-3 hover:bg-[var(--color-green-accent)] transition-colors cursor-pointer">
      <span className="flex min-w-0 gap-3">
        {icon ? (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-card)] text-[var(--color-green-primary)]">
            <FontAwesomeIcon icon={icon} className="w-4" />
          </span>
        ) : null}
        <span>
          <span className="block font-medium font-[family-name:var(--font-header)] text-[var(--color-text-primary)]">{label}</span>
          <span className="block text-sm text-[var(--color-text-secondary)] mt-0.5 font-[family-name:var(--font-body)]">{description}</span>
        </span>
      </span>
      <input
        type="checkbox"
        defaultChecked={checked}
        className="h-5 w-5 shrink-0 accent-[var(--color-green-primary)]"
      />
    </label>
  );
}

function ActionButton({
  label,
  icon,
  danger,
}: {
  label: string;
  icon: IconDefinition;
  danger?: boolean;
}) {
  return (
    <button
      className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors font-[family-name:var(--font-header)] ${
        danger
          ? "border-red-600/70 text-red-600 hover:bg-red-600/10"
          : "border-[var(--color-green-primary)] hover:bg-[var(--color-green-accent)]"
      }`}
      type="button"
    >
      <span className="flex items-center gap-3 font-medium">
        <FontAwesomeIcon
          icon={icon}
          className={`w-4 ${danger ? "text-red-600" : "text-[var(--color-green-primary)]"}`}
        />
        {label}
      </span>
      <FontAwesomeIcon icon={faChevronRight} className="w-3 text-[var(--color-text-secondary)]" />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        <header className="bg-gradient-to-r from-[var(--color-green-primary)] to-[var(--color-green-primary)] text-[var(--color-text-on-green)] px-6 pt-6 pb-8 rounded-b-3xl">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Link
                href="../HomePage"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Back to home"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4" />
              </Link>
              <div className="w-8 h-8 bg-[var(--color-text-on-green)] rounded-full flex items-center justify-center text-[var(--color-green-primary)]">
                <FontAwesomeIcon icon={faRobot} className="w-4" />
              </div>
              <div>
                <p className="text-xs text-white/80 font-[family-name:var(--font-body)]">SEB: Eco Assistant</p>
                <h1 className="text-xl font-semibold font-[family-name:var(--font-header)]">Settings</h1>
              </div>
            </div>
            <Link
              href="../HomePage"
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-medium hover:bg-white/30 transition-colors font-[family-name:var(--font-header)]"
            >
              <FontAwesomeIcon icon={faHome} className="w-4" />
              Home
            </Link>
          </div>

          <div className="bg-[var(--color-bg-card)] rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[var(--color-text-secondary)] text-sm font-medium font-[family-name:var(--font-body)]">
                  Eco Legend in Training
                </p>
                <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1 font-[family-name:var(--font-header)]">
                  Points: <span className="text-[var(--color-green-primary)]">12,450</span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <FontAwesomeIcon icon={faTrophy} className="w-6 text-amber-500" />
                <span className="text-xs text-[var(--color-text-secondary)] mt-1 font-[family-name:var(--font-body)]">Level 7</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-2 font-[family-name:var(--font-body)]">
              <span>Progress to Level 8</span>
              <span>70%</span>
            </div>
            <div className="w-full bg-[var(--color-green-accent)] rounded-full h-2">
              <div className="bg-[var(--color-green-primary)] h-2 rounded-full w-[70%]" />
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-4 px-4 py-5">
          <SettingsCard
            title="Notifications"
            description="Choose what Recyvo should remind you about."
          >
            <div className="space-y-2">
              {notificationSettings.map((setting) => (
                <ToggleRow key={setting.label} {...setting} />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title="Privacy"
            description="Control permissions and how your data is used."
          >
            <div className="space-y-2">
              {privacySettings.map((setting) => (
                <ToggleRow key={setting.label} {...setting} />
              ))}
            </div>
            <div className="grid gap-2 mt-4 sm:grid-cols-2">
              <ActionButton label="Download My Data" icon={faDownload} />
              <ActionButton label="Privacy Policy" icon={faShieldHalved} />
            </div>
          </SettingsCard>

          <SettingsCard
            title="Preferences"
            description="Set the language and app appearance you prefer."
          >
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faGlobe} className="w-4 text-green-500" />
                  Language
                </span>
                <select className="w-full border border-zinc-600 bg-zinc-700 rounded-lg p-3 text-white outline-none focus:border-green-500">
                  <option>English (US)</option>
                  <option>Romanian (RO)</option>
                  <option>German (DE)</option>
                  <option>French (FR)</option>
                  <option>Spanish (ES)</option>
                </select>
              </label>

              <div>
                <p className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faPalette} className="w-4 text-green-500" />
                  Theme
                </p>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Light", icon: faSun },
                    { label: "Dark", icon: faMoon, checked: true },
                    { label: "Device", icon: faDesktop },
                  ].map((theme) => (
                    <label
                      key={theme.label}
                      className="flex items-center gap-3 rounded-lg bg-zinc-700/60 px-3 py-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                      <input
                        type="radio"
                        name="theme"
                        defaultChecked={theme.checked}
                        className="accent-green-600"
                      />
                      <FontAwesomeIcon icon={theme.icon} className="w-4 text-zinc-300" />
                      <span className="font-medium">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Recycling Preferences"
            description="Tune bin suggestions around the way you recycle."
          >
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faRecycle} className="w-4 text-green-500" />
                Preferred materials
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {recyclingMaterials.map((material) => (
                  <label
                    key={material}
                    className="flex items-center gap-2 rounded-lg bg-zinc-700/60 px-3 py-3 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={material !== "Metal"}
                      className="accent-green-600"
                    />
                    <span className="font-medium">{material}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faRoute} className="w-4 text-green-500" />
                  Max nearby distance
                </span>
                <select className="w-full border border-zinc-600 bg-zinc-700 rounded-lg p-3 text-white outline-none focus:border-green-500">
                  <option>1 km</option>
                  <option>3 km</option>
                  <option>5 km</option>
                  <option>10 km</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-2 font-medium">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 text-green-500" />
                  Distance unit
                </span>
                <select className="w-full border border-zinc-600 bg-zinc-700 rounded-lg p-3 text-white outline-none focus:border-green-500">
                  <option>Kilometers</option>
                  <option>Miles</option>
                </select>
              </label>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Accessibility"
            description="Make Recyvo easier to read and navigate."
          >
            <div className="mb-4">
              <p className="mb-2 flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faTextHeight} className="w-4 text-green-500" />
                Text size
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Small", "Medium", "Large"].map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-3 rounded-lg bg-zinc-700/60 px-3 py-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                  >
                    <input
                      type="radio"
                      name="text-size"
                      defaultChecked={size === "Medium"}
                      className="accent-green-600"
                    />
                    <FontAwesomeIcon
                      icon={faUniversalAccess}
                      className="w-4 text-zinc-300"
                    />
                    <span className="font-medium">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {accessibilitySettings.map((setting) => (
                <ToggleRow
                  key={setting.label}
                  {...setting}
                  icon={
                    setting.label === "High contrast mode"
                      ? faCircleHalfStroke
                      : faArrowsRotate
                  }
                />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title="Advanced & Security">
            <div className="space-y-2">
              {securitySettings.map((setting) => (
                <ToggleRow key={setting.label} {...setting} />
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title="App Status"
            description="Check app health, sync state, and installed version."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "App version", value: "1.0.0", icon: faCodeBranch },
                { label: "Last sync", value: "Today, 15:20", icon: faArrowsRotate },
                { label: "Connection", value: "Online", icon: faWifi },
                { label: "Changelog", value: "View latest updates", icon: faFileContract },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg bg-zinc-700/60 px-3 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-green-500">
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                  </span>
                  <span>
                    <span className="block text-sm text-zinc-400">{item.label}</span>
                    <span className="block font-medium">{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard
            title="Support & Legal"
            description="Find help or review Recyvo policies."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {supportActions.map((action) => (
                <ActionButton
                  key={action.label}
                  label={action.label}
                  icon={action.icon}
                />
              ))}
            </div>
          </SettingsCard>

          <Link
            href="../HomePage"
            className="flex w-full items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-xl font-semibold hover:bg-red-700 transition-colors font-[family-name:var(--font-header)]"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
            Logout
          </Link>
        </div>
      </div>
    </main>
  );
}
