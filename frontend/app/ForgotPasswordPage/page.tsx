import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-(--color-bg-main) font-(family-name:--font-body)">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-(--color-bg-card)">
        <Image
          className=""
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-(--color-text-primary) font-(family-name:--font-header)">
            To get started, edit the page.tsx file. <FontAwesomeIcon icon={faCoffee} />
          </h1>
          <p className="max-w-md text-lg leading-8 text-(--color-text-secondary) font-(family-name:--font-body)">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-(--color-text-primary)"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-(--color-text-primary)"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-(--color-green-primary) px-5 text-(--color-text-on-green) transition-colors hover:opacity-90 md:w-39.5 font-(family-name:--font-header)"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
              className="flex h-12 w-full items-center justify-center rounded-full border border-(--color-green-primary) px-5 transition-colors hover:bg-(--color-green-accent) md:w-39.5 font-(family-name:--font-header)"
            />Documentation
          </a>
        </div>
      </main>
    </div>
  );
}