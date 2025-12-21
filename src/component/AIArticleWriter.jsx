import React, { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";

// ✅ Stable model
const PRIMARY_MODEL = "gpt-4o-mini";
const FALLBACK_MODEL = null;

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

export default function AIWriterPuterPermanent() {
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

  const [puter, setPuter] = useState(null);

  const modelUsed = useMemo(() => PRIMARY_MODEL, []);

  // ✅ Permanent: load Puter via NPM (SSR-safe)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (typeof window === "undefined") return;
        const mod = await import("@heyputer/puter.js"); // docs: import { puter } ... :contentReference[oaicite:1]{index=1}
        if (!alive) return;
        setPuter(mod.puter);
        setPuterReady(true);
      } catch (e) {
        if (!alive) return;
        setError(
          "Puter SDK failed to load via NPM. Please run: npm install @heyputer/puter.js"
        );
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const ensurePuter = async () => {
    if (puter) return puter;

    // last attempt if state not set yet
    const mod = await import("@heyputer/puter.js");
    setPuter(mod.puter);
    setPuterReady(true);
    return mod.puter;
  };

  const signInWithPuter = async () => {
    setError("");
    const p = await ensurePuter();

    if (p?.ui?.authenticateWithPuter) {
      await p.ui.authenticateWithPuter();
      setSignedIn(true);
      return;
    }
    if (p?.auth?.signIn) {
      await p.auth.signIn();
      setSignedIn(true);
      return;
    }
    throw new Error("Puter sign-in method not available.");
  };

  const signOutFromPuter = async () => {
    setError("");
    const p = await ensurePuter();
    try {
      if (p?.auth?.signOut) await p.auth.signOut();
    } finally {
      setSignedIn(false);
    }
  };

  const maybeFetchUrlText = async (p, raw) => {
    const trimmed = raw.trim();

    // Upwork mode: URL fetching disabled
    if (mode === "upwork") {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    if (!isProbablyUrl(trimmed)) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    // Prefer Puter net.fetch (better than normal fetch for many sites)
    if (p?.net?.fetch) {
      const res = await p.net.fetch(trimmed);
      const html = await res.text();
      const text = htmlToReadableText(html);
      return {
        sourceText: `URL: ${trimmed}\n\nPAGE TEXT:\n${text.slice(0, 12000)}`,
        fetchedFromUrl: true,
      };
    }

    // Fallback (may fail due to site CORS)
    const res = await fetch(trimmed);
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

  const chatWithFallback = async (p, messages, opts) => {
    try {
      // Note: docs example shows puter.ai.chat(text, opts). :contentReference[oaicite:2]{index=2}
      // Your existing signature also works in many builds; keep it but handle failures.
      return await p.ai.chat(messages, false, opts);
    } catch (e1) {
      try {
        const retryOpts = { ...opts };
        if (FALLBACK_MODEL) retryOpts.model = FALLBACK_MODEL;
        else delete retryOpts.model;
        return await p.ai.chat(messages, false, retryOpts);
      } catch (e2) {
        throw new Error(`Puter AI error.\n\n${stringifyError(e1)}\n\n${stringifyError(e2)}`);
      }
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
      const p = await ensurePuter();

      if (!signedIn) {
        await signInWithPuter();
      }

      const { sourceText } = await maybeFetchUrlText(p, trimmed);
      const { system, user, maxTokens } = buildPrompts(sourceText);

      const messages = [
        { role: "system", content: system },
        { role: "user", content: user },
      ];

      const resp = await chatWithFallback(p, messages, {
        model: modelUsed,
        temperature: 0.6,
        max_tokens: maxTokens,
      });

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      // Article word count enforce once
      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const fixMessages = [
            { role: "system", content: system },
            { role: "user", content: `Rewrite the article to be STRICTLY 800–1000 words. Keep exact structure. Here is draft:\n\n${text}` },
          ];
          const resp2 = await chatWithFallback(p, fixMessages, {
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
          <p className="text-gray-600">Provide Your Idea</p>

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
              <span>Status: {puterReady ? "Loaded" : "Loading..."}</span>
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
            disabled={loading || !puterReady}
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

            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
}
