import React, { useMemo, useState } from "react";
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
  Instagram,
  Download,
} from "lucide-react";

// ======================
// ✅ Puter SDK (Permanent fix)
// ======================
// 1) Puter SDK ko locally host karo: /public/puter.js
// 2) Agar local missing ho, fallback CDN (without crossOrigin)
const PUTER_LOCAL_SRC = "/puter.js";
const PUTER_CDN_SRC = "https://js.puter.com/v2/";

// ✅ Stable model for ALL modes
const PRIMARY_MODEL = "gpt-4o-mini";
const FALLBACK_MODEL = null; // null => let Puter choose default

// ======================
// ✅ RapidAPI: Instagram Tagged Posts (Frontend-only)
// ======================
// ⚠️ Key will be visible in browser. Use backend to protect it.
const IG_RAPIDAPI_KEY = "PASTE_YOUR_RAPIDAPI_KEY_HERE"; // <— replace
const IG_RAPIDAPI_HOST = "instagram-scraper-stable-api.p.rapidapi.com";
const IG_TAGGED_URL = `https://${IG_RAPIDAPI_HOST}/get_ig_user_tagged_posts.php`;

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

// ✅ Puter global getter (no crossOrigin anywhere)
function getPuterGlobal() {
  const g =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : {};
  return g.puter || null;
}

async function waitForPuterGlobal(timeoutMs = 7000, intervalMs = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const p = getPuterGlobal();
    if (p) return p;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return null;
}

// ✅ Script loader helper
async function loadScript(src, id) {
  // already loaded?
  if (document.getElementById(id)) return;

  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;

    // ✅ IMPORTANT: never set s.crossOrigin (it triggers CORS enforcement)
    // s.crossOrigin = "anonymous"; // ❌ do NOT do this

    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

// ✅ Permanent loader: Local first, CDN fallback
async function loadPuterIfNeeded() {
  const already = getPuterGlobal();
  if (already) return already;

  // 1) Try local file (Permanent fix)
  try {
    await loadScript(PUTER_LOCAL_SRC, "puterjs-sdk-local");
    const p1 = await waitForPuterGlobal(4000, 50);
    if (p1) return p1;
  } catch {
    // ignore, fallback to CDN
  }

  // 2) Fallback to CDN
  await loadScript(PUTER_CDN_SRC, "puterjs-sdk-cdn");
  const p2 = await waitForPuterGlobal(7000, 50);
  if (p2) return p2;

  // If still not found:
  throw new Error(
    [
      "Puter SDK loaded but global `puter` is missing.",
      "",
      "Permanent fix:",
      "• Download Puter SDK from https://js.puter.com/v2/ and place it in /public/puter.js",
      "",
      "Other possible causes:",
      "• Adblock/Brave shields blocking scripts",
      "• Host-level CSP blocking inline/eval (rare) or third-party resources",
      "",
      "Debug:",
      "• DevTools → Network → check /puter.js returns 200 and JS content",
    ].join("\n")
  );
}

function extractChatText(resp) {
  if (!resp) return "";
  if (typeof resp === "string") return resp.trim();
  const content = resp?.message?.content;
  if (typeof content === "string") return content.trim();
  return "";
}

export default function AIWriterPuterFixed() {
  const [mode, setMode] = useState("article"); // article | linkedin | upwork
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [copied, setCopied] = useState(false);

  // ======================
  // ✅ Instagram Tagged Posts feature states
  // ======================
  const [igUsername, setIgUsername] = useState("");
  const [igUserId, setIgUserId] = useState("");
  const [igExtraParams, setIgExtraParams] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igError, setIgError] = useState("");
  const [igResultText, setIgResultText] = useState("");

  const modelUsed = useMemo(() => PRIMARY_MODEL, []);

  const ensurePuter = async () => {
    const puter = await loadPuterIfNeeded();
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

    throw new Error("Puter sign-in method not available in this SDK build.");
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

    // ✅ Upwork mode: URL fetching disabled — treat everything as plain text
    if (mode === "upwork") {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    if (!isProbablyUrl(trimmed)) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    const res = await puter.net.fetch(trimmed);
    const html = await res.text();
    const text = htmlToReadableText(html);
    const limited = text.slice(0, 12000);

    return {
      sourceText: `URL: ${trimmed}\n\nPAGE TEXT:\n${limited}`,
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

  const chatWithFallback = async (puter, messages, opts) => {
    try {
      return await puter.ai.chat(messages, false, opts);
    } catch (e1) {
      const msg1 = stringifyError(e1);
      try {
        const retryOpts = { ...opts };
        if (FALLBACK_MODEL) retryOpts.model = FALLBACK_MODEL;
        else delete retryOpts.model;
        return await puter.ai.chat(messages, false, retryOpts);
      } catch (e2) {
        const msg2 = stringifyError(e2);
        throw new Error(`Puter AI error.\n\nFirst try:\n${msg1}\n\nRetry:\n${msg2}`);
      }
    }
  };

  // ======================
  // ✅ Instagram Tagged posts call
  // ======================
  const parseExtraParams = (text) => {
    const params = {};
    const lines = (text || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      let k = "";
      let v = "";
      if (line.includes("=")) [k, v] = line.split("=").map((s) => s.trim());
      else if (line.includes(":")) [k, v] = line.split(":").map((s) => s.trim());
      if (k) params[k] = v ?? "";
    }
    return params;
  };

  const fetchTaggedPosts = async () => {
    setIgError("");
    setIgResultText("");

    if (!IG_RAPIDAPI_KEY || IG_RAPIDAPI_KEY === "PASTE_YOUR_RAPIDAPI_KEY_HERE") {
      setIgError("Please set IG_RAPIDAPI_KEY at the top of the file.");
      return;
    }

    const extra = parseExtraParams(igExtraParams);
    const bodyObj = { ...extra };
    if (igUsername.trim()) bodyObj.username = igUsername.trim();
    if (igUserId.trim()) bodyObj.user_id = igUserId.trim();

    setIgLoading(true);
    try {
      const res = await fetch(IG_TAGGED_URL, {
        method: "POST",
        headers: {
          "x-rapidapi-key": IG_RAPIDAPI_KEY,
          "x-rapidapi-host": IG_RAPIDAPI_HOST,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(bodyObj),
      });

      const text = await res.text();

      if (!res.ok) throw new Error(text || `Request failed (HTTP ${res.status})`);
      setIgResultText(text);
    } catch (e) {
      setIgError(stringifyError(e));
    } finally {
      setIgLoading(false);
    }
  };

  const runAI = async () => {
    setError("");
    setOutput("");
    setCopied(false);

    const trimmed = input.trim();
    if (!trimmed) {
      setError(mode === "upwork" ? "Please paste the client job description." : "Please enter a topic, a URL, or source text.");
      return;
    }

    setLoading(true);
    try {
      const puter = await ensurePuter();

      if (!signedIn) {
        await signInWithPuter();
      }

      const { sourceText } = await maybeFetchUrlText(puter, trimmed);
      const { system, user, maxTokens } = buildPrompts(sourceText);

      const messages = [
        { role: "system", content: system },
        { role: "user", content: user },
      ];

      const resp = await chatWithFallback(puter, messages, {
        model: modelUsed,
        temperature: 0.6,
        max_tokens: maxTokens,
      });

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const fixMessages = [
            { role: "system", content: system },
            { role: "user", content: `Rewrite the article to be STRICTLY 800–1000 words. Keep exact structure. Here is draft:\n\n${text}` },
          ];
          const resp2 = await chatWithFallback(puter, fixMessages, {
            model: modelUsed,
            temperature: 0.4,
            max_tokens: 1900,
          });
          const fixed = extractChatText(resp2);
          if (fixed) text = fixed;
        }
      }

      setOutput(text);
    } catch (e) {
      setError(stringifyError(e));
    } finally {
      setLoading(false);
    }
  };

  const onCtrlEnter = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      runAI();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              (Free Write) Article • LinkedIn • Upwork
            </h1>
          </div>
          <p className="text-gray-600">Provide You Idea</p>

          {mode !== "upwork" && (
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Paste a public URL to auto-fetch page text.
            </p>
          )}
        </div>

        {/* Auth bar */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"}`} />
              <span>Status: {puterReady ? "Loaded" : "Loads on action"}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${signedIn ? "bg-green-500" : "bg-gray-300"}`} />
              <span>Sign-in: {signedIn ? "Signed in" : "Not signed in"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                try {
                  await signInWithPuter();
                } catch (e) {
                  setError(stringifyError(e));
                }
              }}
              className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>

            <button
              onClick={signOutFromPuter}
              className="inline-flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium border"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("article")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "article" ? "bg-purple-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              Article (SEO)
            </button>
            <button
              onClick={() => setMode("linkedin")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "linkedin" ? "bg-purple-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              LinkedIn Post
            </button>
            <button
              onClick={() => setMode("upwork")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "upwork" ? "bg-purple-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              Upwork Proposal
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            {mode === "upwork" ? "Client Job Description" : "Topic / URL / Source Text"}
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onCtrlEnter}
            placeholder={mode === "upwork" ? "Paste the client job description here..." : "Enter a topic OR paste a public URL OR paste source text..."}
            className="w-full h-44 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-700"
          />

          {/* Upwork optional fields */}
          {mode === "upwork" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Optional: Experience (Upwork only)
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Example: I build WordPress tools, forms, custom plugins, etc."
                  className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-700"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  Optional: Portfolio links (Upwork only)
                </label>
                <textarea
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="Paste links (one per line)."
                  className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-700"
                />
              </div>
            </div>
          )}

          {/* Instagram Tagged Posts API feature (only in Upwork mode) */}
          {mode === "upwork" && (
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Instagram Tagged Posts (RapidAPI)</h3>
                </div>

                <button
                  onClick={fetchTaggedPosts}
                  disabled={igLoading}
                  className="inline-flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-lg font-medium"
                >
                  {igLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Fetch Tagged Posts
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                API parameters different ho sakte hain. Agar aapko exact params pata hain, “Extra Params” me key=value lines me add kar do.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Username (optional)</label>
                  <input
                    value={igUsername}
                    onChange={(e) => setIgUsername(e.target.value)}
                    placeholder="example: john_doe"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">User ID (optional)</label>
                  <input
                    value={igUserId}
                    onChange={(e) => setIgUserId(e.target.value)}
                    placeholder="example: 1234567890"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>

              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Extra Params (optional) — one per line (key=value)
                </label>
                <textarea
                  value={igExtraParams}
                  onChange={(e) => setIgExtraParams(e.target.value)}
                  placeholder={`Examples:\ncount=20\ncursor=\ninclude_media=true`}
                  className="w-full h-28 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700"
                />
              </div>

              {igError && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700 whitespace-pre-wrap">{igError}</div>
                  </div>
                </div>
              )}

              {igResultText && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      <Download className="w-4 h-4 text-purple-600" />
                      API Response
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(igResultText);
                        } catch {
                          setIgError("Copy failed. Please manually copy the response below.");
                        }
                      }}
                      className="inline-flex items-center gap-2 text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Response
                    </button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap break-words text-gray-800">{igResultText}</pre>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 whitespace-pre-wrap">{error}</div>
              </div>
            </div>
          )}

          <button
            onClick={runAI}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-600" />
                  Output
                </h2>
                {mode === "article" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Word count: <span className="font-medium">{wordCount(output)}</span>
                  </p>
                )}
              </div>

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    setError("Copy failed. Please manually select and copy.");
                  }
                }}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 px-4 py-2.5 rounded-lg transition-all font-medium shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">{output}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
