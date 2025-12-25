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

async function waitForPuter(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.puter) return window.puter;
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
}

export default function SimpleAIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const chatContainerRef = useRef(null);
  const conversationHistory = useRef([]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    waitForPuter().then((puter) => {
      if (puter) setPuterReady(true);
    });
  }, []);

  const signInWithPuter = async () => {
    const puter = await waitForPuter();
    if (!puter) {
      alert("Puter SDK not found. Make sure it's loaded in your HTML.");
      return;
    }

    try {
      if (puter?.ui?.authenticateWithPuter) {
        await puter.ui.authenticateWithPuter();
      } else if (puter?.auth?.signIn) {
        await puter.auth.signIn();
      }
      setSignedIn(true);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  const signOutFromPuter = async () => {
    const puter = await waitForPuter();
    try {
      if (puter?.auth?.signOut) await puter.auth.signOut();
    } finally {
      setSignedIn(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    conversationHistory.current.push({ role: "user", content: trimmed });
    setInput("");
    setLoading(true);

    try {
      const puter = await waitForPuter();
      if (!puter) throw new Error("Puter SDK not available");

      if (!signedIn) {
        await signInWithPuter();
      }

      const resp = await puter.ai.chat(
        conversationHistory.current,
        false,
        {
          model: PRIMARY_MODEL,
          temperature: 0.7,
          max_tokens: 2000,
        }
      );

      let text = "";
      if (typeof resp === "string") {
        text = resp.trim();
      } else if (resp?.message?.content) {
        text = resp.message.content.trim();
      }

      if (!text) throw new Error("No response from AI");

      conversationHistory.current.push({ role: "assistant", content: text });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${err.message || "Something went wrong"}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    conversationHistory.current = [];
    setInput("");
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Chat Assistant
                </h1>
                <p className="text-gray-600 text-sm">Chat naturally with AI</p>
              </div>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                <div className={`w-2 h-2 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">{puterReady ? "Ready" : "Loading"}</span>
              </div>
              
              {!signedIn ? (
                <button
                  onClick={signInWithPuter}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={signOutFromPuter}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm border"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg border h-[calc(100vh-180px)] flex flex-col">
          {/* Chat Header */}
          <div className="border-b p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">AI Assistant</h2>
            </div>
            <button
              onClick={clearChat}
              className="text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-blue-500"
                      : "bg-indigo-500"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : msg.isError
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className={`text-xs mb-1 ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {msg.role === "user" ? "You" : "AI"}
                    <span className="ml-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  
                  {msg.role === "assistant" && !msg.isError && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className={`mt-2 text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                        msg.role === "user" 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                rows="2"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-400 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Press <kbd className="px-1 bg-gray-200 rounded">Enter</kbd> to send
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Powered by Puter AI • Model: {PRIMARY_MODEL}</p>
        </div>
      </div>
    </div>
  );
}
