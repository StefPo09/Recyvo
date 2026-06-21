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
import {useState, type Dispatch, type KeyboardEvent, type ChangeEvent, type SetStateAction, useEffect, useMemo} from "react";
import {useRouter} from "next/navigation";
import { useSettings } from "@/lib/SettingsContext";

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

   // Remove markdown formatting (bold, italic, etc.) from text
   function stripMarkdown(text: string): string {
     return text
       .replace(/\*\*(.*?)\*\*/g, "$1") // **bold** → bold
       .replace(/\*(.*?)\*/g, "$1") // *italic* → italic
       .replace(/__(.*?)__/g, "$1") // __bold__ → bold
       .replace(/_(.*?)_/g, "$1") // _italic_ → italic
       .replace(/~~(.*?)~~/g, "$1"); // ~~strikethrough~~ → strikethrough
   }

  function sendMessage() {
    const trimmedMessage = inputText.trim();

    if (!trimmedMessage) {
      return;
    }
    // add the user's message immediately to the UI
    const userEntry = {
      message: trimmedMessage,
      sender: "user" as ChatSender,
      id: crypto.randomUUID(),
    };

    setChatMessages((previousMessages) => [...previousMessages, userEntry]);
    setInputText("");

    // Call the local AI endpoint once per message (stateless) and do NOT send prior conversation
    // The AI is instructed via a system prompt to only discuss eco-friendly topics and be family-friendly.
    (async () => {
        try {
        // use same-origin proxy to avoid CORS/mixed-content issues
        const aiEndpoint = "/api/ai-proxy";
        const payload = {
          model: "minimaxai/minimax-m3",
          messages: [
            {
              role: "system",
              content:
                "You are SEB, an eco-friendly assistant. Only talk about recycling, sustainable living, and environmental topics. Do not reference or continue any previous conversations or mention memory. If the user asks about unrelated topics, politely decline and steer the user to an eco-friendly subject. Always use family-friendly language suitable for all ages. Do NOT use bold, italic, or any markdown formatting. Use plain text only.",
            },
            { role: "user", content: trimmedMessage },
          ],
          temperature: 0.6,
          max_tokens: 2048,
        };

        const res = await fetch(aiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // try to extract body text for better diagnostics
          let bodyText = "";
          try {
            bodyText = await res.text();
          } catch (e) {
            bodyText = String(e);
          }
          throw new Error(`AI request failed: ${res.status} ${res.statusText} - ${bodyText}`);
        }

        const data = await res.json();

        // Handle error objects returned by the proxy
        if (data?.error) {
          const errorMsg = data?.details ?? data?.body?.detail ?? JSON.stringify(data);
          throw new Error(`API error: ${errorMsg}`);
        }

        // Support common OpenAI-compatible shape: choices[0].message.content
        let aiText = "";
        if (data?.choices && Array.isArray(data.choices) && data.choices[0]) {
          aiText = data.choices[0].message?.content ?? data.choices[0].text ?? "";
        } else if (typeof data === "string") {
          aiText = data;
        } else if (data?.choices && data.choices.length === 0) {
          throw new Error("Model returned empty response. Please try again.");
        } else {
          aiText = JSON.stringify(data);
        }

        if (!aiText) {
          throw new Error("Model returned empty message content.");
        }

        // Strip any markdown formatting as a safeguard
        const cleanedText = stripMarkdown(aiText);

        const botEntry = {
          message: cleanedText,
          sender: "robot" as ChatSender,
          id: crypto.randomUUID(),
        };

        setChatMessages((previousMessages) => [...previousMessages, botEntry]);
      } catch (err) {
        const errMessage = `Sorry, I couldn't reach the assistant. Please try again later.`;
        setChatMessages((previousMessages) => [
          ...previousMessages,
          {
            message: errMessage,
            sender: "robot" as ChatSender,
            id: crypto.randomUUID(),
          },
        ]);
        // Keep the error in console for debugging
        // eslint-disable-next-line no-console
        console.error(err);
      }
    })();
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-full border-2 border-green-800 bg-white px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md dark:border-green-700 dark:bg-gray-950">
        <input
          type="text"
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-50 dark:placeholder:text-gray-400"
          placeholder="Ask about recycling, eco-friendly tips, or sustainable living..."
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
  const router = useRouter();
  const { isDark, settings } = useSettings();

  const mainClassName = useMemo(() => {
    const textSizeClass =
        settings.textSize === "Small"
            ? "text-sm"
            : settings.textSize === "Large"
                ? "text-lg"
                : "text-base";
    const themeClass = isDark
        ? "bg-zinc-900 text-white"
        : "bg-zinc-100 text-zinc-950";
    const contrastClass = (settings.toggles as Record<string, boolean>)["High contrast mode"]
        ? "contrast-125"
        : "";

    return `${themeClass} ${textSizeClass} ${contrastClass}`;
  }, [isDark, settings.textSize, settings.toggles]);

  useEffect(() => {
    // simple redirect if no user in localStorage
    const userExists = localStorage.getItem("user");
    if (!userExists) router.push("/StartPage");
  }, [router]);
  return (
    <main className={`flex h-screen flex-col ${mainClassName}`}>
      <div className={`bg-linear-to-r text-(--color-text-on-green) px-6 pt-6 pb-8 rounded-b-3xl ${isDark ? "from-green-900 to-green-800" : "from-green-600 to-green-500"}`}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-(--color-text-on-green) rounded-full flex items-center justify-center text-(--color-green-primary) font-bold text-sm">
              🤖
            </div>
            <h1 className="text-lg font-semibold font-(family-name:--font-header)">SEB: Eco Assistant</h1>
          </div>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Privacy:</span> Conversations won't be saved. SEB does not retain or recall past discussions.
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
              <p className="mt-1 text-2xl font-bold text-(--color-text-primary) font-(family-name:--font-header)">Points: <span className="text-(--color-green-primary)">12,450</span></p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">🏅</span>
              <span className="text-xs text-(--color-text-secondary) mt-1">Level 7</span>
            </div>
          </div>

          <div className="h-2 w-full rounded-full bg-(--color-green-accent)">
            <div className="h-2 rounded-full bg-(--color-green-primary)" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>

      <section className="flex-1 overflow-y-auto px-4 py-4">
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
