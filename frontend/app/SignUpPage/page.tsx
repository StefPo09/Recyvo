import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9fA] px-5 py-6 sm:grid sm:place-items-center dark:bg-black">
      <Image
        src="" // Adauga file path-ul catre logo color
        alt={"LOGO"}
      />

      <h1 className="mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
        SEB: Brașov Eco Assistant
      </h1>

      <div className={"w-3/4 bg-[#FFFFFF] dark:bg-gray-950"}>
        <h1 className="mb-4 text-center text-[36px] leading-none tracking-normal text-[#1A2B23] dark:text-green-200">
          SIGN UP
        </h1>
      </div>
    </main>
  );
}