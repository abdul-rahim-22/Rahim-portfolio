import React, { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Link as LinkIcon,
  LogIn,
  LogOut,
  FileText,
  Briefcase,
  Send,
  User,
  Bot,
  Trash2,
  MessageSquare,
} from "lucide-react";

const PRIMARY_MODEL = "gpt-4o-mini";

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function extractChatText(resp) {
  if (!resp) return "";
  if (typeof resp === "string") return resp.trim();
  const content = resp?.message?.content;
  if (typeof content === "string") return content.trim();
  return "";
}

function stringifyError(err) {
  if (!err) return "Unknown error.";
  if (typeof err === "string") return err;
  if (err?.message) return err.message;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
}

async function waitForPuter(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window !== "undefined" && window.puter) return window.puter;
    await new Promise((r) => setTimeout(r, 60));
  }
  return null;
}

export default function AIChatWriter() {
  const [mode, setMode] = useState("article");
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "👋 Hello! I'm your AI content assistant. Choose a content type below and tell me what you'd like to create.\n\nI can help you with:\n• 📝 SEO Articles (800-1000 words)\n• 💼 LinkedIn Posts (engaging & practical)\n• 📋 Upwork Proposals (professional templates)",
      timestamp: new Date(),
    },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const ensurePuter = async () => {
    setError("");
    const puter = await waitForPuter();
    if (!puter) {
      setPuterReady(false);
      throw new Error(
        "Puter SDK not found. Make sure you added this in index.html:\n<script src=\"https://js.puter.com/v2/?v=2\" defer></script>"
      );
    }
    setPuterReady(true);
    return puter;
  };

  const signInWithPuter = async () => {
    setError("");
    const puter = await ensurePuter();

    if (puter?.ui?.authenticateWithPuter) {
      await puter.ui.authenticateWithPuter();
      setSignedIn(true);
      return;
    }
    if (puter?.auth?.signIn) {
      await puter.auth.signIn();
      setSignedIn(true);
      return;
    }

    throw new Error("Puter sign-in method not available.");
  };

  const signOutFromPuter = async () => {
    setError("");
    const puter = await ensurePuter();
    try {
      if (puter?.auth?.signOut) await puter.auth.signOut();
    } finally {
      setSignedIn(false);
    }
  };

  const getSystemPrompt = () => {
    const common = "Write in simple, natural English that feels human. Avoid fluff and repetition. Output in clean Markdown. Return ONLY the final result without any explanations or notes.";

    if (mode === "article") {
      return `You are a professional SEO editor and web article writer. You follow strict structure and word count. Keep it simple and human.

${common}

Article Requirements (STRICT):
- Length: 800 to 1000 words (strict)
- Structure:
  1) Title
  2) Hooking introduction (2-3 short paragraphs)
  3) 3 to 5 headings with concise paragraphs
  4) 3-6 bullet takeaways (practical)
  5) Strong conclusion (2-4 lines)
- Clarity: Simple English, easy to read
- No filler. No unnecessary repetition.

SEO Rules:
- Choose ONE primary keyword phrase and use it naturally in:
  - Title
  - first 120 words
  - at least 2 headings
- Add related keywords naturally (no stuffing).

Format output in clean Markdown with proper headings.`;
    }

    if (mode === "linkedin") {
      return `You write LinkedIn posts in simple English. Make it scannable, practical, and human. No hype.

${common}

LinkedIn Post Requirements:
- Write ONE LinkedIn post with:
  - A strong first line hook
  - 4 to 8 short lines/paragraphs
  - 3 to 6 bullet points with practical advice
  - One clear CTA line (question/invitation)
  - 3 to 6 relevant hashtags at the end
- Keep it professional but conversational
- Focus on providing real value
- Use emojis sparingly (1-3 max)`;
    }

    // upwork
    return `You are an Upwork proposal writer. Write concise, specific proposals in simple English matching the client needs.

${common}

Upwork Proposal Template (USE EXACTLY this structure):

Hello [Client Name],

I can help you achieve [their exact goal] by [your approach], so you get [result] without [main risk].

From your post, you need:
- [requirement #1]
- [requirement #2]
- [requirement #3]

My plan:
1) [Step 1] → Deliverable: [deliverable]
2) [Step 2] → Deliverable: [deliverable]
3) [Step 3] → Deliverable: [deliverable]

Relevant proof:
- [Similar project/result with numbers OR strong specific outcome]
- [1 portfolio item or 1 short result]

Quick questions:
1) [question that affects scope]
2) [question that affects timeline]

Next step: Share [URL/files/access], and I will confirm milestones + start with [small first milestone].

Kind regards,
(your-name)

Important Rules:
1. Do NOT add extra sections or headers
2. Do NOT invent client name - use [Client Name] placeholder
3. Use optional experience/portfolio info ONLY in "Relevant proof" section
4. Keep it concise and specific to the job requirements
5. Focus on client benefits, not just features`;
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const puter = await ensurePuter();

      if (!signedIn) {
        await signInWithPuter();
      }

      const systemPrompt = getSystemPrompt();
      
      // Build user message with optional info for upwork mode
      let userPrompt = trimmed;
      if (mode === "upwork") {
        userPrompt = `Client Job Description:\n${trimmed}\n\n`;
        if (experience.trim()) {
          userPrompt += `My Experience:\n${experience.trim()}\n\n`;
        }
        if (portfolioLinks.trim()) {
          userPrompt += `My Portfolio Links:\n${portfolioLinks.trim()}\n\n`;
        }
        userPrompt += "Please write an Upwork proposal using the exact template structure mentioned in the system prompt.";
      }

      const resp = await puter.ai.chat(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        false,
        {
          model: PRIMARY_MODEL,
          temperature: mode === "article" ? 0.4 : 0.6,
          max_tokens: mode === "article" ? 2000 : mode === "linkedin" ? 800 : 1200,
        }
      );

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      // Word count check for articles
      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const resp2 = await puter.ai.chat(
            [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Please rewrite this article to be STRICTLY 800–1000 words (currently ${wc} words). Keep the exact structure but adjust length:\n\n${text}`,
              },
            ],
            false,
            { model: PRIMARY_MODEL, temperature: 0.3, max_tokens: 2200 }
          );

          const fixed = extractChatText(resp2);
          if (fixed) text = fixed;
        }
      }

      // Add assistant message with mode info
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: text,
        timestamp: new Date(),
        mode: mode,
        wordCount: wordCount(text),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `❌ Error: ${stringifyError(e)}\n\nPlease try again or check your internet connection.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(stringifyError(e));
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
        content: "👋 Hello! I'm your AI content assistant. Choose a content type below and tell me what you'd like to create.\n\nI can help you with:\n• 📝 SEO Articles (800-1000 words)\n• 💼 LinkedIn Posts (engaging & practical)\n• 📋 Upwork Proposals (professional templates)",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setError("");
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const getModeIcon = (modeType) => {
    switch (modeType) {
      case "article":
        return "📝";
      case "linkedin":
        return "💼";
      case "upwork":
        return "📋";
      default:
        return "🤖";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "article":
        return "Article Writer";
      case "linkedin":
        return "LinkedIn Post Creator";
      case "upwork":
        return "Upwork Proposal Writer";
      default:
        return "AI Assistant";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Content Writer Chat
                </h1>
                <p className="text-gray-600 text-sm">Chat-based content generation</p>
              </div>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
                <div className={`w-2 h-2 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-sm">{puterReady ? "Ready" : "Loading SDK"}</span>
              </div>
              
              {!signedIn ? (
                <button
                  onClick={signInWithPuter}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={signOutFromPuter}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { id: "article", label: "📝 Article", desc: "SEO Articles (800-1000 words)" },
                { id: "linkedin", label: "💼 LinkedIn", desc: "Engaging Posts" },
                { id: "upwork", label: "📋 Upwork", desc: "Professional Proposals" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center min-w-[120px] ${
                    mode === m.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="text-lg">{m.label.split(' ')[0]}</span>
                  <span className="text-xs mt-1">{m.label.split(' ')[1]}</span>
                  <span className={`text-xs mt-1 ${mode === m.id ? 'text-white/90' : 'text-gray-500'}`}>
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Current mode: <span className="font-semibold text-purple-600">{getModeLabel()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Container - Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[calc(100vh-250px)] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">{getModeLabel()}</h2>
                    <p className="text-xs text-gray-500">Using {PRIMARY_MODEL}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-sm"
                          : "bg-gradient-to-br from-purple-500 to-indigo-500 shadow-sm"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
                          : msg.isError
                          ? "bg-red-50 border border-red-100"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            {msg.role === "user" ? "You" : `${getModeIcon(msg.mode || mode)} AI Assistant`}
                          </span>
                          <span className="text-xs text-gray-400">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {msg.mode && !msg.isError && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            {msg.mode === "article" ? "Article" : msg.mode === "linkedin" ? "LinkedIn" : "Upwork"}
                          </span>
                        )}
                      </div>
                      
                      <div className={`whitespace-pre-wrap text-gray-800 leading-relaxed ${
                        msg.isError ? "text-red-700" : ""
                      }`}>
                        {msg.content}
                      </div>
                      
                      {msg.role === "assistant" && !msg.isError && (
                        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {msg.wordCount && (
                              <span className="text-xs text-gray-500">
                                📊 {msg.wordCount} words
                              </span>
                            )}
                            {msg.mode === "article" && msg.wordCount && (
                              <span className={`text-xs ${
                                msg.wordCount >= 800 && msg.wordCount <= 1000 
                                  ? "text-green-600" 
                                  : "text-amber-600"
                              }`}>
                                {msg.wordCount >= 800 && msg.wordCount <= 1000 
                                  ? "✓ Word count OK" 
                                  : "⚠ Check word count"}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            Generating {mode === "article" ? "article" : mode === "linkedin" ? "LinkedIn post" : "Upwork proposal"}...
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {mode === "article" 
                              ? "Creating 800-1000 word SEO article..." 
                              : mode === "linkedin"
                              ? "Writing engaging LinkedIn post with hashtags..."
                              : "Building professional Upwork proposal template..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={
                        mode === "article"
                          ? "Describe your article topic or paste content..."
                          : mode === "linkedin"
                          ? "What's your LinkedIn post about?"
                          : "Paste the Upwork job description here..."
                      }
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none pr-12"
                      rows="3"
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {wordCount(input)} words
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="self-end bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-4 rounded-xl transition-all disabled:cursor-not-allowed shadow-sm"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Enter</kbd> to send • 
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mx-1">Shift + Enter</kbd> for new line
                  </p>
                  <div className="text-xs text-gray-500">
                    Mode: <span className="font-medium text-purple-600">{mode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mode Instructions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                {mode === "article" ? "Article Instructions" : 
                 mode === "linkedin" ? "LinkedIn Instructions" : 
                 "Upwork Instructions"}
              </h3>
              
              {mode === "article" && (
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>What to send:</strong></p>
                  <ul className="space-y-2 pl-2">
                    <li>• Article topic or subject</li>
                    <li>• Target keywords (optional)</li>
                    <li>• Specific requirements</li>
                    <li>• Reference content or URLs</li>
                  </ul>
                  <p className="pt-2 border-t border-gray-200">
                    <strong>Output:</strong> 800-1000 word SEO article with proper structure.
                  </p>
                </div>
              )}

              {mode === "linkedin" && (
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>What to send:</strong></p>
                  <ul className="space-y-2 pl-2">
                    <li>• Post topic or idea</li>
                    <li>• Key points to cover</li>
                    <li>• Target audience</li>
                    <li>• Desired tone</li>
                  </ul>
                  <p className="pt-2 border-t border-gray-200">
                    <strong>Output:</strong> Engaging LinkedIn post with hashtags and CTA.
                  </p>
                </div>
              )}

              {mode === "upwork" && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p><strong>What to send:</strong></p>
                    <ul className="space-y-2 pl-2 mt-2">
                      <li>• Full job description</li>
                      <li>• Client requirements</li>
                      <li>• Project scope details</li>
                    </ul>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Experience (Optional)
                    </label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., 5+ years experience in web development, specialized in React..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Links (Optional)
                    </label>
                    <textarea
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                      placeholder="https://example.com/portfolio\nhttps://github.com/username"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      rows="3"
                    />
                  </div>

                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <strong>Output:</strong> Professional proposal using exact template structure.
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">✨ Features</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span><strong>Smart Templates:</strong> Each mode uses optimized templates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span><strong>Word Count Control:</strong> Articles strictly 800-1000 words</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span><strong>One-click Copy:</strong> Copy generated content instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span><strong>Chat History:</strong> All conversations saved in chat</span>
                </li>
              </ul>
            </div>

            {/* Quick Examples */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">💡 Quick Examples</h3>
              <div className="space-y-2">
                {mode === "article" && (
                  <>
                    <button
                      onClick={() => setInput("Write about the benefits of remote work for productivity")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "Benefits of remote work for productivity"
                    </button>
                    <button
                      onClick={() => setInput("SEO article about sustainable energy solutions")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "Sustainable energy solutions for homes"
                    </button>
                  </>
                )}
                {mode === "linkedin" && (
                  <>
                    <button
                      onClick={() => setInput("Tips for improving team collaboration in remote settings")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "Remote team collaboration tips"
                    </button>
                    <button
                      onClick={() => setInput("How to build a personal brand on LinkedIn")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "Building a personal brand on LinkedIn"
                    </button>
                  </>
                )}
                {mode === "upwork" && (
                  <>
                    <button
                      onClick={() => setInput("Looking for a React developer to build a dashboard with charts and user authentication. Need it in 2 weeks.")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "React dashboard with charts project"
                    </button>
                    <button
                      onClick={() => setInput("Need a WordPress expert to fix site speed issues and optimize for SEO. Budget $500.")}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      "WordPress speed optimization project"
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>AI can make mistakes. Please verify important information.</p>
          <p className="mt-1">Powered by Puter AI • Model: {PRIMARY_MODEL}</p>
        </div>
      </div>
    </div>
  );
}