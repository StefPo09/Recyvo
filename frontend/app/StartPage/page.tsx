import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faUser } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fA] px-5 py-6 sm:grid sm:place-items-center dark:bg-black">
      <Image
        src="" // Adauga file path-ul catre logo color
        alt="LOGO"
      />

      <h1 className="mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        SEB: Brașov Eco Assistant
      </h1>
      <div className="mb-8 text-center text-[24px] leading-[1.18] text-[#1A2B23] dark:text-green-200">
        <p>Your smart path to a cleaner Brașov.</p>
        <p>Scan. Sort. Share.</p>
      </div>
      <div className="flex w-md flex-col gap-3">
        <button className="h-14 rounded-lg bg-[#17692f] text-[18px] text-white shadow-[inset_0_2px_6px_rgba(255,255,255,0.14),0_3px_7px_rgba(18,84,39,0.25)] transition hover:bg-[#125826] focus:outline-none focus:ring-4 focus:ring-[#17692f]/25">
          LOGIN{" "}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="ml-1 text-white/50"
          />
        </button>
        <button className="flex h-14 items-center justify-center rounded-lg border-2 border-[#17692f] bg-white text-[17px] text-[#17692f] transition hover:bg-[#f3faf5] focus:outline-none focus:ring-4 focus:ring-[#17692f]/20">
          <FontAwesomeIcon icon={faUser} className="mr-3 text-[18px]" />
          CREATE FREE ACCOUNT
        </button>
        <button className="flex h-12 items-center justify-center rounded-lg border-2 border-[#17692f] bg-white text-[16px] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:bg-[#e8ecee] focus:outline-none focus:ring-4 focus:ring-slate-300">
          <FcGoogle className="mr-2 text-[22px]" />
          Sign in with Google
        </button>
      </div>
      <a href="" className="mt-4 text-center text-[14px] text-[#1A2B23] hover:underline dark:text-green-200">
        Forgot password? Contact support.
      </a>
    </main>
  );
}