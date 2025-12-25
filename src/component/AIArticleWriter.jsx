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
} from "lucide-react";

const PRIMARY_MODEL = "gpt-4o-mini";

function isProbablyUrl(text) {
  const t = text.trim();
  return /^https?:\/\/\S+$/i.test(t);
}

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function htmlToReadableText(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    doc.querySelectorAll("script, style, noscript, iframe, svg").forEach((n) => n.remove());
    return (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
  } catch {
    return (html || "").replace(/\s+/g, " ").trim();
  }
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
      content: "Hello! I can help you create content. Choose a mode below and tell me what you'd like to write about.",
      timestamp: new Date(),
    },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  
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

  const maybeFetchUrlText = async (puter, raw) => {
    const trimmed = raw.trim();

    if (mode === "upwork") {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    if (!isProbablyUrl(trimmed)) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    const res = await puter.net.fetch(trimmed);
    const html = await res.text();
    const text = htmlToReadableText(html);

    return {
      sourceText: `URL: ${trimmed}\n\nPAGE TEXT:\n${text.slice(0, 12000)}`,
      fetchedFromUrl: true,
    };
  };

  const buildPrompts = (sourceText) => {
    const common =
      "Write in simple, natural English that feels human. Avoid fluff and repetition. Output in clean Markdown. Return ONLY the final result.";

    if (mode === "article") {
      return {
        system:
          "You are a professional SEO editor and web article writer. You follow strict structure and word count. Keep it simple and human.",
        user: `
Topic / source:
${sourceText}

Requirements (STRICT):
- Length: 800 to 1000 words (strict)
- Structure:
  1) Title
  2) Hooking introduction (2-3 short paragraphs)
  3) 3 to 5 headings with concise paragraphs
  4) 3-6 bullet takeaways (practical)
  5) Strong conclusion (2-4 lines)
- Clarity: Simple English, easy to read
- No filler. No unnecessary repetition.

SEO:
- Choose ONE primary keyword phrase and use it naturally in:
  - Title
  - first 120 words
  - at least 2 headings
- Add related keywords naturally (no stuffing).

${common}
`,
        maxTokens: 1800,
      };
    }

    if (mode === "linkedin") {
      return {
        system: "You write LinkedIn posts in simple English. Make it scannable, practical, and human. No hype.",
        user: `
Idea / source:
${sourceText}

Write ONE LinkedIn post with:
- A strong first line hook
- 4 to 8 short lines/paragraphs
- 3 to 6 bullet points with practical advice
- One clear CTA line (question/invitation)
- 3 to 6 relevant hashtags at the end

${common}
`,
        maxTokens: 800,
      };
    }

    // upwork
    return {
      system: "You are an Upwork proposal writer. Write concise, specific proposals in simple English matching the client needs.",
      user: `
Client job post / requirements:
${sourceText}

Write an Upwork proposal using EXACTLY this template structure:

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

Rules:
- Do NOT add extra sections.
- Do NOT invent client name.
- Use optional info ONLY in "Relevant proof" if present (otherwise keep proof general).

Optional info:
Experience:
${experience?.trim() ? experience.trim() : "(none)"}

Portfolio links:
${portfolioLinks?.trim() ? portfolioLinks.trim() : "(none)"}

${common}
`,
      maxTokens: 1100,
    };
  };

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

      const { sourceText } = await maybeFetchUrlText(puter, trimmed);
      const { system, user, maxTokens } = buildPrompts(sourceText);

      const resp = await puter.ai.chat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        false,
        {
          model: PRIMARY_MODEL,
          temperature: 0.6,
          max_tokens: maxTokens,
        }
      );

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const resp2 = await puter.ai.chat(
            [
              { role: "system", content: system },
              {
                role: "user",
                content: `Rewrite the article to be STRICTLY 800–1000 words. Keep exact structure. Here is draft:\n\n${text}`,
              },
            ],
            false,
            { model: PRIMARY_MODEL, temperature: 0.4, max_tokens: 1900 }
          );

          const fixed = extractChatText(resp2);
          if (fixed) text = fixed;
        }
      }

      // Add assistant message
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${stringifyError(e)}`,
        timestamp: new Date(),
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
        content: "Hello! I can help you create content. Choose a mode below and tell me what you'd like to write about.",
        timestamp: new Date(),
      },
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getModeDescription = () => {
    switch (mode) {
      case "article":
        return "Generate SEO-optimized articles (800-1000 words)";
      case "linkedin":
        return "Create engaging LinkedIn posts with practical advice";
      case "upwork":
        return "Write professional Upwork proposals";
      default:
        return "Select a content type";
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
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Content Writer
                </h1>
                <p className="text-gray-600 text-sm">Article • LinkedIn • Upwork</p>
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
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              ) : (
                <button
                  onClick={signOutFromPuter}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
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
              {["article", "linkedin", "upwork"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {m === "article" && "Article"}
                  {m === "linkedin" && "LinkedIn Post"}
                  {m === "upwork" && "Upwork Proposal"}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">{getModeDescription()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[calc(100vh-250px)] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">AI Content Assistant</h2>
                    <p className="text-xs text-gray-500">Using {PRIMARY_MODEL}</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </button>
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
                          ? "bg-gradient-to-br from-blue-500 to-cyan-400"
                          : "bg-gradient-to-br from-purple-500 to-indigo-500"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
                          : "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="text-sm text-gray-500 mb-1">
                        {msg.role === "user" ? "You" : "AI Assistant"}
                      </div>
                      <div className="text-gray-800 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && !msg.content.startsWith("Error:") && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Content
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
                      <div className="text-sm text-gray-500 mb-2">AI Assistant</div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating {mode === "article" ? "article" : mode === "linkedin" ? "LinkedIn post" : "Upwork proposal"}...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        mode === "article"
                          ? "Enter topic or paste URL for article..."
                          : mode === "linkedin"
                          ? "Enter idea or paste URL for LinkedIn post..."
                          : "Paste client job description for Upwork proposal..."
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="self-end bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex justify-between">
                  <p className="text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  {mode === "article" && (
                    <p className="text-xs text-gray-500">
                      Word count: <span className="font-medium">{wordCount(input)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upwork Optional Fields */}
            {mode === "upwork" && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Upwork Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Experience (Optional)
                    </label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., I've built 50+ WordPress sites with custom plugins..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Portfolio Links (Optional)
                    </label>
                    <textarea
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                      placeholder="Paste your portfolio links (one per line)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                How to Use
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">1</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Choose a content type from the tabs above
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">2</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Type your prompt or paste a URL (articles & LinkedIn)
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">3</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    For Upwork, paste job description and add optional details
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">4</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click send or press Enter to generate content
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  SEO-optimized articles (800-1000 words)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Engaging LinkedIn posts with hashtags
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Professional Upwork proposals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  URL fetching for articles & posts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  One-click copy to clipboard
                </li>
              </ul>
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
      </div>
    </div>
  );
}