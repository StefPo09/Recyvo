"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faComments,
  faHome,
  faMap,
  faRobot,
  faPaperPlane,
  faUser, faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {useState, type Dispatch, type KeyboardEvent, type ChangeEvent, type SetStateAction, useEffect} from "react";
import {useRouter} from "next/navigation";

type ChatSender = "user" | "robot";

type ChatEntry = {
  id: string;
  message: string;
  sender: ChatSender;
};

function TopBar({userData}  : {userData: any}) {
  return(
    <div className="shrink-0 bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">
            🤖
          </div>
          <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
        </div>
        <Link
          href="../SettingsPage"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
          aria-label="Settings"
        >
          <FontAwesomeIcon icon={faUserGear} className="text-sm" />
          <span>Settings</span>
        </Link>
      </div>


      <div className="bg-(--color-bg-card) rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-(--color-text-secondary) text-sm font-medium font-(family-name:--font-body)">{userData?.nume || "User"}</p>
            <p className="text-2xl font-bold text-(--color-text-primary) mt-1 font-(family-name:--font-header)">Points: <span className="text-(--color-green-primary)">{userData?.nr_puncte || 0}</span></p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🏅</span>
            <span className="text-xs text-(--color-text-secondary) mt-1">Level 7</span>
          </div>
        </div>

        <div className="w-full bg-(--color-green-accent) rounded-full h-2">
          <div className="bg-(--color-green-primary) h-2 rounded-full" style={{ width: "70%" }}></div>
        </div>
      </div>
    </div>
  )
}

function formatTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function SebAvatar() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 shadow-sm">
      <FontAwesomeIcon icon={faRobot} className="text-lg" />
    </div>
  );
}

function ChatInput({
  setChatMessages,
}: {
  setChatMessages: Dispatch<SetStateAction<ChatEntry[]>>;
}) {
  const [inputText, setInputText] = useState("");

  function saveInputText(e: ChangeEvent<HTMLInputElement>) {
    setInputText(e.target.value);
  }

  function enterPressed(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    const trimmedMessage = inputText.trim();

    if (!trimmedMessage) {
      return;
    }

    // Add the response here and give it to the response const
    const response = "Hello World!";

    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        message: trimmedMessage,
        sender: "user",
        id: crypto.randomUUID(),
      },
      {
        message: response,
        sender: "robot",
        id: crypto.randomUUID(),
      },
    ]);

    setInputText("");
    console.log(response);
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border-2 border-green-800 bg-white px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md dark:border-green-700 dark:bg-gray-950">
        <input
          type="text"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-50 dark:placeholder:text-gray-400"
          placeholder="Type your message to SEB..."
          onChange={saveInputText}
          value={inputText}
          onKeyDown={enterPressed}
        />
        <button
          type="button"
          onClick={sendMessage}
          aria-label="Send message"
          disabled={!inputText.trim()}
          className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-800 text-white shadow-sm transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-green-300 dark:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-900/40"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
        </button>
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-center">
        <SebAvatar />
        <span className="mt-0.5 text-[10px] leading-none text-gray-500 dark:text-gray-400">{formatTime()}</span>
      </div>
      <div className="max-w-[74%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-3 text-[15px] font-semibold leading-tight text-gray-950 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50">
        {message}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[74%] rounded-2xl rounded-br-sm bg-green-800 px-3.5 py-3 text-[15px] font-medium leading-tight text-white shadow-sm dark:bg-green-700">
        {message}
        <span className="ml-2 align-baseline text-[10px] text-green-100">{formatTime()}</span>
      </div>
    </div>
  );
}

function ChatBubble({ message, sender }: Omit<ChatEntry, "id">) {
  return (
    <div>
      {sender === "robot" ? (
        <AssistantMessage
          message={message}
        />
      ) : (
        <UserMessage
          message={message}
        />
      )}
    </div>
  );
}

function ChatMessages({ chatMessages }: { chatMessages: ChatEntry[] }) {
  if (chatMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-green-200 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur dark:border-green-900 dark:bg-gray-900/70">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700 dark:bg-green-950/50 dark:text-green-400">
          🤖
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-50">Start a conversation with SEB</p>
        <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
          Ask for recycling tips, bin locations, or eco-friendly ideas.
        </p>
      </div>
    );
  }

  return (
    <>
      {chatMessages.map((chatMessage) => {
        return (
          <ChatBubble
            message={chatMessage.message}
            sender={chatMessage.sender}
            key={chatMessage.id}
          />
        );
      })}
    </>
  );
}

function BottomNav() {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-black">
      <div className="flex justify-around">
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
    </div>
  );
}

export default function Home() {
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([]);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userExists = localStorage.getItem("user");
    if (!userExists) router.push("/StartPage");
  }, [router]);
  return (
    <main className="flex h-screen flex-col bg-(--color-bg-main) text-(--color-text-primary)">
      <div className="bg-linear-to-r from-(--color-green-primary) to-(--color-green-primary) text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">
              🤖
            </div>
            <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
          </div>
          <Link
            href="./" // Add settingsPage
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium hover:bg-white/20 transition-colors"
            aria-label="Settings"
          >
            <FontAwesomeIcon icon={faUserGear} className="text-sm" />
            <span>Settings</span>
          </Link>
        </div>


        <div className="rounded-xl bg-(--color-bg-card) p-4 shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-(--color-text-secondary) text-sm font-medium font-(family-name:--font-body)">Eco Legend in Training</p>
              <p className="mt-1 text-2xl font-bold text-(--color-text-primary) font-(family-name:--font-header)">Karma Points: <span className="text-(--color-green-primary)">12,450</span></p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">🏅</span>
              <span className="text-xs text-(--color-text-secondary) mt-1">Level 7</span>
            </div>
          </div>

    if (userExists) {
      try {
        const user = JSON.parse(userExists);
        setUserData(user);
        setIsAuthenticated(true);
      } catch (e) {
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
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-(--color-bg-main) text-(--color-text-primary)">
      <TopBar
        userData={userData}
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <ChatMessages
            chatMessages={chatMessages}
          />
        </div>
      </section>

      <div className="shrink-0">
        <ChatInput
          setChatMessages={setChatMessages}
        />
      </div>

      <BottomNav />
    </main>
  );
}
