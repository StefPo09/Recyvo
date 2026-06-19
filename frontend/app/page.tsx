import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMap, faClock, faHome, faUser, faComments, faLeaf } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">

      <div className="bg-linear-to-r from-green-700 to-green-600 dark:from-green-900 dark:to-green-800 text-white px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-700 shadow-sm">
            <FontAwesomeIcon icon={faLeaf} className="text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">SEB — Brașov Eco Assistant</h1>
            <p className="text-sm opacity-90 mt-0.5">Small actions. Big impact.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md dark:shadow-none">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Eco Legend in Training</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-extrabold text-black dark:text-white">12,450</p>
                <p className="text-sm text-gray-500">Points</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900 flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">Level 7</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-linear-to-r from-green-600 to-green-500 h-2 rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">

        <Link href="/ScannerPage" className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-lg transition-shadow transform hover:-translate-y-0.5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 shadow-inner">
            <FontAwesomeIcon icon={faCamera} className="text-2xl text-gray-600 dark:text-gray-300" />
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-medium text-center">Scan Your Waste with SEB</p>
        </Link>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/MapPage" className="bg-white/60 dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl py-6 flex flex-col items-center justify-center transition transform hover:-translate-y-0.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 flex items-center justify-center mb-2">
              <FontAwesomeIcon icon={faMap} className="text-lg text-green-700" />
            </div>
            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">Nearby Bins</span>
          </Link>
          <Link href="/AiChatPage" className="bg-white/60 dark:bg-gray-900/70 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl py-6 flex flex-col items-center justify-center transition transform hover:-translate-y-0.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-linear-to-tr from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 flex items-center justify-center mb-2">
              <FontAwesomeIcon icon={faComments} className="text-lg text-green-700" />
            </div>
            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">Chat with SEB</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border-l-4 border-green-600 rounded-2xl p-4 mb-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Daily Challenge</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Scan 3 Cartons today!</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-linear-to-r from-green-600 to-green-500 h-2 rounded-full" style={{ width: "33%" }}></div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-6 py-4 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-green-700">
          <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faHome} className="text-lg" />
          </div>
          <span className="text-xs font-medium">Home</span>
        </button>
        <Link href="/ScannerPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-lg" />
          </div>
          <span className="text-xs font-medium">Scanner</span>
        </Link>
        <Link href="/MapPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faMap} className="text-lg" />
          </div>
          <span className="text-xs font-medium">Map</span>
        </Link>
        <Link href="/CommunityPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faComments} className="text-lg" />
          </div>
          <span className="text-xs font-medium">Community</span>
        </Link>
        <Link href="/ProfilePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-lg" />
          </div>
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}