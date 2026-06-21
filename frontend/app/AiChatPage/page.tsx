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
import {useState, type Dispatch, type KeyboardEvent, type ChangeEvent, type SetStateAction, useEffect} from "react";
import TopBar from "@/components/TopBar";
import {useRouter} from "next/navigation";

type ChatSender = "user" | "robot";

type UserData = {
  nume?: string;
  nr_puncte?: number;
};

type ChatEntry = {
  id: string;
  message: string;
  sender: ChatSender;
};

// TopBar provided by shared component

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
  setIsLoadingResponse,
}: {
  setChatMessages: Dispatch<SetStateAction<ChatEntry[]>>;
  setIsLoadingResponse: Dispatch<SetStateAction<boolean>>;
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

  async function sendMessage() {
    const trimmedMessage = inputText.trim();

    if (!trimmedMessage) {
      return;
    }

    // Add the user's message immediately
    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        message: trimmedMessage,
        sender: "user",
        id: crypto.randomUUID(),
      },
    ]);

    setInputText("");
    setIsLoadingResponse(true);

    // Build payload for the AI proxy. The proxy forwards this to NVIDIA's chat completions endpoint.
    const payload = {
      model: "minimaxai/minimax-m3",
      messages: [
        {
          role: "system",
          content:
            "You are SEB, an eco-friendly assistant. Only answer questions about recycling, sustainable living, and environmental topics. If the user asks about unrelated topics, politely decline and steer them to an eco-friendly subject. Use family-friendly language suitable for all ages.",
        },
        { role: "user", content: trimmedMessage },
      ],
      max_tokens: 2048,
      temperature: 0.6,
      top_p: 0.95,
      stream: false,
    };

    // Call the local ai-proxy route which forwards to NVIDIA. Extract a sensible assistant text from the response.
    let assistantText = "Sorry, I couldn't get a response.";
    try {
      const res = await fetch("/api/ai-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("ai-proxy error", res.status, txt);
        assistantText = "Sorry, the assistant is unavailable.";
      } else {
        const data = await res.json();

        // Typical NVIDIA / OpenAI-like response formats: try several known fields
        if (data?.choices && data.choices[0]?.message?.content) {
          assistantText = data.choices[0].message.content;
        } else if (Array.isArray(data?.output) && data.output[0]?.content?.[0]?.text) {
          assistantText = data.output[0].content[0].text;
        } else if (typeof data?.text === "string") {
          assistantText = data.text;
        } else {
          // Fallback: stringify the whole response for debugging
          assistantText = JSON.stringify(data);
        }
      }
    } catch (err) {
      // Network or parsing error
      // eslint-disable-next-line no-console
      console.error("AI request failed:", err);
      assistantText = "Sorry, the assistant is unreachable.";
    }

    // Append the assistant's response
    setChatMessages((previousMessages) => [
      ...previousMessages,
      {
        message: assistantText,
        sender: "robot",
        id: crypto.randomUUID(),
      },
    ]);
    console.log(assistantText);
    setIsLoadingResponse(false);
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex max-w-6/7 items-center gap-2 rounded-full border-2 border-green-800 bg-white px-3 py-2 shadow-sm transition-shadow focus-within:shadow-md dark:border-green-700 dark:bg-gray-950">
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
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-3 text-[15px] font-semibold leading-tight text-gray-950 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50">
        {message}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-green-800 px-3.5 py-3 text-[15px] font-medium leading-tight text-white shadow-sm dark:bg-green-700">
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

function ThinkingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-col items-center">
        <SebAvatar />
        <span className="mt-0.5 text-[10px] leading-none text-gray-500 dark:text-gray-400">{formatTime()}</span>
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-3.5 py-3 text-[15px] font-semibold leading-tight text-gray-950 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-50">
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </div>
      </div>
    </div>
  );
}

function ChatMessages({ chatMessages, isLoading }: { chatMessages: ChatEntry[]; isLoading: boolean }) {
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
      {isLoading && <ThinkingIndicator />}
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
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const userExists = localStorage.getItem("user");
    if (!userExists) {
      router.push("/StartPage");
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userExists) as UserData;
      setUserData(user);
      setIsAuthenticated(true);
    } catch {
      router.push("/StartPage");
    }

    setIsLoading(false);
  }, [router]);

  // Initialize with a greeting message from the bot when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !hasInitialized) {
      setHasInitialized(true);

      async function fetchInitialGreeting() {
        setIsLoadingResponse(true);

        const payload = {
          model: "minimaxai/minimax-m3",
          messages: [
            {
              role: "system",
              content:
                "You are SEB, an eco-friendly assistant. Only answer questions about recycling, sustainable living, and environmental topics. If the user asks about unrelated topics, politely decline and steer them to an eco-friendly subject. Use family-friendly language suitable for all ages.",
            },
            { role: "user", content: "Hello!" },
          ],
          max_tokens: 2048,
          temperature: 0.6,
          top_p: 0.95,
          stream: false,
        };

        let greetingText = "Hello! I'm SEB, your eco-friendly assistant. How can I help you today?";
        try {
          const res = await fetch("/api/ai-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();

            // Extract the greeting response
            if (data?.choices && data.choices[0]?.message?.content) {
              greetingText = data.choices[0].message.content;
            } else if (Array.isArray(data?.output) && data.output[0]?.content?.[0]?.text) {
              greetingText = data.output[0].content[0].text;
            } else if (typeof data?.text === "string") {
              greetingText = data.text;
            }
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch greeting:", err);
        }

        // Add only the bot's greeting (not the user's "Hello!")
        setChatMessages([
          {
            message: greetingText,
            sender: "robot",
            id: crypto.randomUUID(),
          },
        ]);

        setIsLoadingResponse(false);
      }

      fetchInitialGreeting();
    }
  }, [isAuthenticated, hasInitialized]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-(--color-bg-main) text-(--color-text-primary)">
      <TopBar
        userData={userData}
      />

       <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
         <div className="mx-auto flex max-w-6/7 flex-col gap-3">
           <ChatMessages
             chatMessages={chatMessages}
             isLoading={isLoadingResponse}
           />
         </div>
       </section>

       <div className="shrink-0">
         <ChatInput
           setChatMessages={setChatMessages}
           setIsLoadingResponse={setIsLoadingResponse}
         />
       </div>

      <BottomNav />
    </main>
  );
}
