"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faComments,
  faHome,
  faMap,
  faRobot,
  faPaperPlane,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, type Dispatch, type KeyboardEvent, type ChangeEvent, type SetStateAction } from "react";

type ChatSender = "user" | "robot";

type ChatEntry = {
  id: string;
  message: string;
  sender: ChatSender;
};

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
    <div className="mt-auto flex justify-around border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-black">
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
  const [chatMessages, setChatMessages] = useState<ChatEntry[]>([]);
  return (
    <main className="flex h-screen flex-col bg-white dark:bg-black">
      <div className="rounded-b-3xl bg-linear-to-r from-green-700 to-green-600 px-6 pb-8 pt-6 text-white dark:from-green-900 dark:to-green-800">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-green-700">
            🤖
          </div>
          <h1 className="text-lg font-semibold">SEB: Eco Assistant</h1>
        </div>


        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 dark:shadow-none">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Eco Legend in Training</p>
              <p className="mt-1 text-2xl font-bold text-black dark:text-white">Points: <span className="text-green-700">12,450</span></p>
            </div>
            <div className="flex flex-col items-center rounded-full bg-green-50 px-3 py-1 dark:bg-green-950/40">
              <span className="text-2xl">🏅</span>
              <span className="text-xs text-gray-500 mt-1">Level 7</span>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-green-600" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>

      <section className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 dark:bg-gray-950">
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <ChatMessages
            chatMessages={chatMessages}
          />
        </div>
      </section>

      <ChatInput
        setChatMessages={setChatMessages}
      />

      <BottomNav />
    </main>
  );
}
