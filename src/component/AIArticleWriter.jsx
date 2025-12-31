import React, { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Send,
  User,
  Bot,
  Trash2,
  MessageSquare,
  LogIn,
  LogOut,
  Copy,
  Check,
} from "lucide-react";

const PRIMARY_MODEL = "gpt-4o-mini";

/* ------------------ PUTER LOADER ------------------ */
async function waitForPuter(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.puter) return window.puter;
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
}

/* ------------------ COMPONENT ------------------ */
export default function SimpleAIChat() {
  const [mode, setMode] = useState("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  /* ---------- MODE BASED MEMORY ---------- */
  const memoryRef = useRef({
    chat: [],
    linkedin: [],
    upwork: [],
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI assistant. Choose a mode and start ✨",
      timestamp: new Date(),
    },
  ]);

  const chatRef = useRef(null);

  /* ------------------ SYSTEM PROMPTS ------------------ */
  const getSystemPrompt = () => {
    if (mode === "linkedin") {
      return `You are an expert LinkedIn content creator.
Create high-performing LinkedIn posts with:
- Strong hook
- Short paragraphs
- Bullet points
- Clear CTA
- 3–6 hashtags
Tone: professional, human, engaging.`;
    }

    if (mode === "upwork") {
      return `You are an expert Upwork proposal writer.
Write personalized, concise, client-focused proposals.
Structure clearly and end with smart questions.`;
    }

    return `You are a helpful, friendly AI assistant. Be accurate, concise, and useful.`;
  };

  /* ------------------ AUTO SCROLL ------------------ */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* ------------------ INIT PUTER ------------------ */
  useEffect(() => {
    waitForPuter().then((p) => p && setPuterReady(true));
  }, []);

  /* ------------------ AUTH ------------------ */
  const signIn = async () => {
    const puter = await waitForPuter();
    if (!puter) return alert("Puter SDK not found");
    await puter.ui.authenticateWithPuter();
    setSignedIn(true);
  };

  const signOut = async () => {
    const puter = await waitForPuter();
    await puter?.auth?.signOut();
    setSignedIn(false);
  };

  /* ------------------ SEND MESSAGE ------------------ */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    memoryRef.current[mode].push({ role: "user", content: input });
    setInput("");
    setLoading(true);

    try {
      const puter = await waitForPuter();
      if (!signedIn) await signIn();

      const response = await puter.ai.chat(
        [
          { role: "system", content: getSystemPrompt() },
          ...memoryRef.current[mode],
        ],
        false,
        {
          model: PRIMARY_MODEL,
          temperature: 0.7,
          max_tokens: 2000,
        }
      );

      const text =
        typeof response === "string"
          ? response
          : response?.message?.content;

      if (!text) throw new Error("No response");

      memoryRef.current[mode].push({ role: "assistant", content: text });

      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: text,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "⚠️ Something went wrong. Try again.",
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ CLEAR CHAT ------------------ */
  const clearChat = () => {
    memoryRef.current[mode] = [];
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Chat cleared ✨ Start again.",
        timestamp: new Date(),
      },
    ]);
  };

  /* ------------------ COPY ------------------ */
  const copyText = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  /* ------------------ UI ------------------ */
  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: "#FBF9F8" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <MessageSquare className="text-indigo-600" />
            <h1 className="font-bold text-xl">AI Content Assistant</h1>
          </div>

          {!signedIn ? (
            <button onClick={signIn} className="btn-primary">
              <LogIn size={16} /> Sign In
            </button>
          ) : (
            <button onClick={signOut} className="btn-outline">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>

        {/* MODE */}
        <div className="flex gap-2 mb-4 justify-center">
          {["chat", "linkedin", "upwork"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                clearChat();
              }}
              className={`px-4 py-2 rounded-lg ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CHAT */}
        <div className="bg-white rounded-xl shadow border h-[70vh] flex flex-col">
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${
                  m.role === "user" && "flex-row-reverse"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  {m.role === "user" ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>

                <div className="bg-gray-100 p-3 rounded-lg max-w-[75%]">
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {m.role === "assistant" && !m.isError && (
                    <button
                      onClick={() => copyText(m.content, m.id)}
                      className="text-xs mt-2 flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <Check size={12} />
                      ) : (
                        <Copy size={12} />
                      )}
                      Copy
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <Loader2 className="animate-spin" size={16} />
                Thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="border-t p-3 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded-lg p-2"
              placeholder="Type here..."
              rows={2}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 rounded-lg"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-3 text-gray-500">
          Powered by Puter AI • {PRIMARY_MODEL}
        </p>
      </div>
    </div>
  );
}
