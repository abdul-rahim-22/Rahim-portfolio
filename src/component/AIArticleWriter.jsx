import React, { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Briefcase,
} from "lucide-react";

const PUTER_LOCAL_SRC = "/puter.js";
const PUTER_CDN_SRC = "https://js.puter.com/v2/";
const PRIMARY_MODEL = "gpt-4o-mini";

export default function AIWriterPuter() {
  const [mode, setMode] = useState("article");
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [puter, setPuter] = useState(null);

  useEffect(() => {
    loadPuterIfNeeded();
  }, []);

  async function loadScript(src, id) {
    if (document.getElementById(id)) return;

    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(s);
    });
  }

  async function waitForPuterGlobal(timeoutMs = 7000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (typeof window !== "undefined" && window.puter) {
        return window.puter;
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return null;
  }

  async function loadPuterIfNeeded() {
    if (typeof window !== "undefined" && window.puter) {
      setPuter(window.puter);
      setPuterReady(true);
      return window.puter;
    }

    try {
      await loadScript(PUTER_LOCAL_SRC, "puterjs-sdk-local");
      const p1 = await waitForPuterGlobal(4000);
      if (p1) {
        setPuter(p1);
        setPuterReady(true);
        return p1;
      }
    } catch (e) {
      console.log("Local Puter not found, trying CDN...");
    }

    try {
      await loadScript(PUTER_CDN_SRC, "puterjs-sdk-cdn");
      const p2 = await waitForPuterGlobal(7000);
      if (p2) {
        setPuter(p2);
        setPuterReady(true);
        return p2;
      }
    } catch (e) {
      console.error("CDN load failed:", e);
    }

    setError(
      "Puter SDK not loaded. Download from https://js.puter.com/v2/ and place in /public/puter.js"
    );
    return null;
  }

  async function signInWithPuter() {
    setError("");
    try {
      let p = puter;
      if (!p) {
        p = await loadPuterIfNeeded();
        if (!p) throw new Error("Puter not available");
        setPuter(p);
      }

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

      throw new Error("Puter sign-in method not available");
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function signOutFromPuter() {
    setError("");
    try {
      if (puter?.auth?.signOut) {
        await puter.auth.signOut();
      }
      setSignedIn(false);
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  function wordCount(text) {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function htmlToReadableText(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      doc
        .querySelectorAll("script, style, noscript, iframe, svg")
        .forEach((n) => n.remove());
      return (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
    } catch {
      return (html || "").replace(/\s+/g, " ").trim();
    }
  }

  async function fetchPageText(url) {
    if (!puter) throw new Error("Puter not loaded");
    const res = await puter.net.fetch(url);
    const html = await res.text();
    const text = htmlToReadableText(html);
    return text.slice(0, 12000);
  }

  function isProbablyUrl(text) {
    return /^https?:\/\/\S+$/i.test(text.trim());
  }

  function buildPrompts(sourceText) {
    const common =
      "Write in simple, natural English that feels human. Avoid fluff and repetition. Output in clean Markdown. Return ONLY the final result.";

    if (mode === "article") {
      return {
        system:
          "You are a professional SEO editor and web article writer. You follow strict structure and word count. Keep it simple and human.",
        user: `Topic / source:\n${sourceText}\n\nRequirements (STRICT):\n- Length: 800 to 1000 words (strict)\n- Structure:\n  1) Title\n  2) Hooking introduction (2-3 short paragraphs)\n  3) 3 to 5 headings with concise paragraphs\n  4) 3-6 bullet takeaways (practical)\n  5) Strong conclusion (2-4 lines)\n\n${common}`,
        maxTokens: 1800,
      };
    }

    if (mode === "linkedin") {
      return {
        system:
          "You write LinkedIn posts in simple English. Make it scannable, practical, and human. No hype.",
        user: `Idea / source:\n${sourceText}\n\nWrite ONE LinkedIn post with:\n- A strong first line hook\n- 4 to 8 short lines/paragraphs\n- 3 to 6 bullet points\n- One clear CTA line\n- 3 to 6 relevant hashtags\n\n${common}`,
        maxTokens: 800,
      };
    }

    return {
      system:
        "You are an Upwork proposal writer. Write concise, specific proposals in simple English.",
      user: `Client job post:\n${sourceText}\n\nExperience: ${experience || "(none)"}\nPortfolio: ${portfolioLinks || "(none)"}\n\nWrite proposal template as shown in examples.\n\n${common}`,
      maxTokens: 1100,
    };
  }

  function extractChatText(resp) {
    if (!resp) return "";
    if (typeof resp === "string") return resp.trim();
    const content = resp?.message?.content;
    if (typeof content === "string") return content.trim();
    return "";
  }

  async function chatWithFallback(messages, opts) {
    try {
      return await puter.ai.chat(messages, false, opts);
    } catch (e1) {
      try {
        const retryOpts = { ...opts };
        delete retryOpts.model;
        return await puter.ai.chat(messages, false, retryOpts);
      } catch (e2) {
        throw new Error(`AI Error: ${e2.message || e1.message}`);
      }
    }
  }

  async function runAI() {
    setError("");
    setOutput("");
    setCopied(false);

    const trimmed = input.trim();
    if (!trimmed) {
      setError(
        mode === "upwork"
          ? "Please paste the client job description."
          : "Please enter a topic, a URL, or source text."
      );
      return;
    }

    setLoading(true);
    try {
      let p = puter;
      if (!p) {
        p = await loadPuterIfNeeded();
        if (!p) throw new Error("Puter not available");
        setPuter(p);
      }

      if (!signedIn) {
        if (p?.ui?.authenticateWithPuter) {
          await p.ui.authenticateWithPuter();
          setSignedIn(true);
        } else if (p?.auth?.signIn) {
          await p.auth.signIn();
          setSignedIn(true);
        }
      }

      let sourceText = trimmed;
      if (mode !== "upwork" && isProbablyUrl(trimmed)) {
        sourceText = await fetchPageText(trimmed);
      }

      const { system, user, maxTokens } = buildPrompts(sourceText);

      const messages = [
        { role: "system", content: system },
        { role: "user", content: user },
      ];

      const resp = await chatWithFallback(messages, {
        model: PRIMARY_MODEL,
        temperature: 0.6,
        max_tokens: maxTokens,
      });

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const fixMessages = [
            {
              role: "system",
              content: "You are an SEO editor. Rewrite to STRICT word count.",
            },
            {
              role: "user",
              content: `Rewrite to STRICTLY 800–1000 words.\n\n${text}`,
            },
          ];
          const resp2 = await chatWithFallback(fixMessages, {
            model: PRIMARY_MODEL,
            temperature: 0.4,
            max_tokens: 1900,
          });
          const fixed = extractChatText(resp2);
          if (fixed) text = fixed;
        }
      }

      setOutput(text);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

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
            <p className="text-xs text-gray-500 mt-2">
              Paste a public URL to auto-fetch page text.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  puterReady ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Status: {puterReady ? "Loaded" : "Loads on action"}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  signedIn ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span>Sign-in: {signedIn ? "Signed in" : "Not signed in"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={signInWithPuter}
              className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              Sign in
            </button>

            <button
              onClick={signOutFromPuter}
              className="inline-flex items-center gap-2 text-sm bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium border"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("article")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "article"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              Article (SEO)
            </button>
            <button
              onClick={() => setMode("linkedin")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "linkedin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              LinkedIn Post
            </button>
            <button
              onClick={() => setMode("upwork")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "upwork"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              Upwork Proposal
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            {mode === "upwork"
              ? "Client Job Description"
              : "Topic / URL / Source Text"}
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onCtrlEnter}
            placeholder={
              mode === "upwork"
                ? "Paste the client job description here..."
                : "Enter a topic OR paste a public URL OR paste source text..."
            }
            className="w-full h-44 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all text-gray-700"
          />

          {mode === "upwork" && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Optional: Experience
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Example: I build WordPress tools, forms, custom plugins, etc."
                  className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Optional: Portfolio links
                </label>
                <textarea
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="Paste links (one per line)."
                  className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700 whitespace-pre-wrap">
                  {error}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={runAI}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg"
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
                    Word count:{" "}
                    <span className="font-medium">{wordCount(output)}</span>
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
                    setError("Copy failed.");
                  }
                }}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 px-4 py-2.5 rounded-lg transition-all font-medium"
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

            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
              {output}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}