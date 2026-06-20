import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faClock, faComments,
  faHome,
  faMap,
  faMapLocationDot,
  faMicrophone,
  faPaperclip,
  faRecycle,
  faRobot,
  faSmile,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function SebAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 shadow-sm">
      <FontAwesomeIcon icon={faRobot} className="text-lg" />
    </div>
  );
}

function AssistantMessage({
  children,
  time = "17:49",
}: {
  children: React.ReactNode;
  time?: string;
}) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-center">
        <SebAvatar />
        <span className="mt-0.5 text-[10px] leading-none text-gray-500 dark:text-gray-400">{time}</span>
      </div>
      <div className="max-w-[74%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-3 text-[15px] font-semibold leading-tight text-gray-950 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50">
        {children}
      </div>
    </div>
  );
}

function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[74%] rounded-2xl rounded-br-sm bg-green-800 px-3.5 py-3 text-[15px] font-medium leading-tight text-white shadow-sm dark:bg-green-700">
        {children}
        <span className="ml-2 align-baseline text-[10px] text-green-100">12:59</span>
      </div>
    </div>
  );
}

function MapAction() {
  return (
    <div className="ml-11 max-w-[82%] rounded-xl border-2 border-green-800 bg-white px-3 py-2.5 text-green-950 shadow-sm dark:border-green-600 dark:bg-gray-900 dark:text-green-50">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faMapLocationDot} className="text-3xl text-green-800 dark:text-green-400" />
        <p className="text-[15px] font-bold leading-tight">
          Go to Map - Muresenilor 5
          <br />
          <span className="font-semibold">(Closest E-waste Point).</span>
        </p>
      </div>
    </div>
  );
}

function ScanPreview() {
  return (
    <div className="ml-11 flex h-11 w-12 items-center justify-center rounded-lg border border-yellow-300 bg-yellow-100 shadow-sm dark:border-yellow-500/60 dark:bg-yellow-500/20">
      <FontAwesomeIcon icon={faRecycle} className="text-2xl text-yellow-600 dark:text-yellow-300" />
    </div>
  );
}

function ScanPhotoBubble() {
  return (
    <div className="flex justify-end">
      <div className="max-w-[72%] overflow-hidden rounded-2xl rounded-br-sm border-2 border-green-800 bg-green-800 p-1 shadow-sm dark:border-green-700 dark:bg-green-700">
        <div className="px-2 pb-2 pt-1 text-[15px] font-medium leading-tight text-white">
          And a bottle like this?
        </div>
        <div className="relative h-36 rounded-xl bg-linear-to-br from-slate-100 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-green-950">
          <div className="absolute inset-x-6 top-4 h-24 rounded-xl bg-white/80 shadow-inner dark:bg-gray-700/80" />
          <div className="absolute bottom-4 left-1/2 h-24 w-10 -translate-x-1/2 rounded-t-lg rounded-b-2xl border border-sky-200 bg-sky-100/80 shadow-md dark:border-sky-400/40 dark:bg-sky-300/20" />
          <div className="absolute left-1/2 top-4 h-4 w-8 -translate-x-1/2 rounded bg-gray-800 dark:bg-gray-300" />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white">
            Scan pending
          </div>
          <div className="absolute left-1.5 top-1.5 h-5 w-5 border-l-2 border-t-2 border-white" />
          <div className="absolute right-1.5 top-1.5 h-5 w-5 border-r-2 border-t-2 border-white" />
          <div className="absolute bottom-1.5 right-1.5 h-5 w-5 border-b-2 border-r-2 border-white" />
        </div>
      </div>
    </div>
  );
}

function BottomNav() {
  return (
      <div className="mt-auto border-t border-gray-200 bg-white px-6 py-4 flex justify-around dark:border-gray-700 dark:bg-black">
        <Link href="../HomePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs font-medium">Scanner</span>
        </Link>
        <Link href="../MapPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faMap} className="text-xl" />
          <span className="text-xs font-medium">Map</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-green-700">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
          <span className="text-xs font-medium">SEB</span>
        </button>
        <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
  );
}

export default function Home() {
  return (
    <main className="flex h-screen flex-col bg-white dark:bg-black">
      <header className="bg-linear-to-r from-green-900 via-green-800 to-green-700 px-5 pb-5 pt-6 text-white shadow-sm dark:from-green-950 dark:via-green-900 dark:to-green-800">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-green-800 shadow-sm">
            <FontAwesomeIcon icon={faRobot} className="text-xl" />
          </div>
          <h1 className="text-lg font-bold leading-tight">SEB: Intelligent Sorting Assistant</h1>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-950">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <UserMessage>SEB, how do I recycle a lightbulb in Brasov?</UserMessage>

          <AssistantMessage>
            Great question! That's
            <br />
            'E-waste' in Brasov.
          </AssistantMessage>

          <MapAction />

          <UserMessage>And a bottle like this?</UserMessage>

          <ScanPhotoBubble />

          <AssistantMessage time="12:49">
            Scanning your image... identified as Plastic &amp; Metal (Aqua Carpatica). Use the Yellow Bin!
          </AssistantMessage>

          <ScanPreview />

          <UserMessage>Perfect, thanks!</UserMessage>

          <AssistantMessage time="12:49">
            You're welcome! Happy sorting! Remember, for other special waste like batteries or chemicals, just ask.
          </AssistantMessage>

          <div className="ml-11 rounded-2xl bg-green-100 px-4 py-3 text-[15px] leading-tight text-green-950 shadow-sm ring-1 ring-green-200 dark:bg-green-950/60 dark:text-green-50 dark:ring-green-800">
            Community: <span className="font-bold">Clean-up Tampa</span> goal reached!{" "}
            <span className="font-bold text-green-700 dark:text-green-300">+15 Pts</span>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-black">
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border-2 border-green-800 bg-white px-3 py-2 shadow-sm dark:border-green-700 dark:bg-gray-950">
          <FontAwesomeIcon icon={faPaperclip} className="text-lg text-green-800 dark:text-green-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-50 dark:placeholder:text-gray-400"
            placeholder="Type your message to SEB..."
          />
          <FontAwesomeIcon icon={faCamera} className="text-base text-green-800 dark:text-green-400" />
          <FontAwesomeIcon icon={faSmile} className="text-lg text-green-800 dark:text-green-400" />
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-800 text-white shadow-sm transition-colors hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-600">
            <FontAwesomeIcon icon={faMicrophone} className="text-base" />
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
