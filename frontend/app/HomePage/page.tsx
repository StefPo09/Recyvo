import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faMap, faClock, faHome, faUser, faComments } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">

      <div className="bg-linear-to-r from-green-700 to-green-600 dark:from-green-900 dark:to-green-800 text-white px-6 pt-6 pb-8 rounded-b-3xl">
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

        <Link href="../ScannerPage" className="bg-gray-100 dark:bg-gray-900 rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer">
          <FontAwesomeIcon icon={faCamera} className="text-3xl text-gray-400 dark:text-gray-300 mb-4" />
          <p className="text-gray-700 dark:text-gray-200 font-medium text-center">Scan Your Waste with SEB</p>
        </Link>


        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="../MapPage" className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faMap} className="text-2xl text-green-700 mb-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">Nearby Bins</span>
          </Link>
          <Link href="../AiChatPage" className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl py-6 flex flex-col items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faComments} className="text-2xl text-green-700 mb-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">Chat with SEB</span>
          </Link>
        </div>


        <div className="bg-white dark:bg-gray-800 border-l-4 border-green-600 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Daily Challenge</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">Scan 3 Cartons today!</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: "33%" }}></div>
          </div>
        </div>
      </div>


      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-6 py-4 flex justify-around">
        <button className="flex flex-col items-center gap-1 text-green-700">
          <FontAwesomeIcon icon={faHome} className="text-xl" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <Link href="../ScannerPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faClock} className="text-xl" />
          <span className="text-xs font-medium">Scanner</span>
        </Link>
        <Link href="../MapPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faMap} className="text-xl" />
          <span className="text-xs font-medium">Map</span>
        </Link>
        <Link href="../CommunityPage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faComments} className="text-xl" />
          <span className="text-xs font-medium">Community</span>
        </Link>
        <Link href="../ProfilePage" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-400 hover:text-gray-600">
          <FontAwesomeIcon icon={faUser} className="text-xl" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}