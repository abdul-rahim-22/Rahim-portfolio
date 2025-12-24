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
  Lightbulb,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Send,
  Eye,
  Users,
  TrendingUp,
} from "lucide-react";

const PRIMARY_MODEL = "gpt-4o-mini";

function isProbablyUrl(text) {
  const t = text.trim();
  return /^https?:\/\/\S+$/i.test(t);
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

export default function LinkedInPostGenerator() {
  const [mode, setMode] = useState("basic"); // basic | advanced
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("desktop"); // desktop | mobile

  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const modelUsed = useMemo(() => PRIMARY_MODEL, []);

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

  const buildPrompt = (sourceText) => {
    if (mode === "basic") {
      return {
        system: "You are a LinkedIn post generator. Create engaging, professional LinkedIn posts that get high engagement. Use emojis sparingly. Include hashtags. Make it feel human and authentic.",
        user: `
Write a LinkedIn post about this topic:
${sourceText}

Create a post that:
1. Has a strong hook in the first line
2. Is 4-6 paragraphs long
3. Includes 3-5 bullet points with practical advice
4. Ends with a call to action or question
5. Includes 3-5 relevant hashtags
6. Is written in natural, conversational English
7. Feels like a real person wrote it

Format with proper line breaks. Don't mark it as AI-generated. Make it valuable and shareable.
`,
        maxTokens: 800,
      };
    } else {
      // Advanced mode
      return {
        system: "You are an expert LinkedIn content strategist. Create viral-style LinkedIn posts with lists, stats, and high engagement elements.",
        user: `
Create a high-performing LinkedIn post about:
${sourceText}

Make it follow this viral template structure:

**Hook:** Start with a surprising statistic or bold statement
**Problem:** Identify a common pain point
**List:** 5-7 points with checkmarks (✓)
**Solution:** How to solve it
**Benefits:** What readers will gain
**Call to Action:** What they should do next
**Hashtags:** 3-5 targeted hashtags

Include emojis (😊 ✓ 🔥) naturally. Make it feel authentic, not spammy. Use line breaks for readability.
`,
        maxTokens: 1000,
      };
    }
  };

  const runAI = async () => {
    setError("");
    setOutput("");
    setCopied(false);

    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter your post idea or topic.");
      return;
    }

    setLoading(true);
    try {
      const puter = await ensurePuter();

      if (!signedIn) {
        await signInWithPuter();
      }

      const { system, user, maxTokens } = buildPrompt(trimmed);

      const resp = await puter.ai.chat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        false,
        {
          model: modelUsed,
          temperature: 0.7,
          max_tokens: maxTokens,
        }
      );

      let text = extractChatText(resp);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      setOutput(text);
    } catch (e) {
      setError(stringifyError(e));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please manually select and copy.");
    }
  };

  const formatPostPreview = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return (
      <div className={`${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
        {/* LinkedIn Post Header */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            AR
          </div>
          <div>
            <div className="font-semibold text-gray-800">Abdul Rahim</div>
            <div className="text-sm text-gray-600">Web Designer & Developer • Sharing insights on digital creativity</div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>12h • 🌍</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                1.2K views
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {lines.map((line, index) => {
              if (line.includes('✓')) {
                return (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{line.replace('✓', '').trim()}</span>
                  </div>
                );
              }
              return (
                <p key={index} className="mb-3 last:mb-0">
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Post Stats */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-blue-500">👍</span>
              64 likes
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              27 comments
            </span>
            <span className="flex items-center gap-1">
              <Send className="w-4 h-4" />
              4 reposts
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-around">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <span className="text-gray-500">👍</span>
              <span>Like</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <MessageSquare className="w-4 h-4" />
              <span>Comment</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <Send className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <span className="text-gray-500">📤</span>
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const onCtrlEnter = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      runAI();
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFDF8] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FREE LINKEDIN POST GENERATOR</h1>
          <p className="text-gray-600">Generate with AI...</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div>
            {/* Mode Tabs */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("basic")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    mode === "basic" 
                      ? "bg-black text-white" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Basic (1 Image)
                </button>
                <button
                  onClick={() => setMode("advanced")}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    mode === "advanced" 
                      ? "bg-black text-white" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Advanced (2 Images)
                </button>
              </div>
            </div>

            {/* Input Section */}
            <div className="bg-white border border-gray-300 rounded-lg p-5 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Write Your Post Idea
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onCtrlEnter}
                placeholder="What do you want to post about? (e.g., 'digital marketing tips', 'career advice', 'industry insights')"
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black resize-none text-gray-700 mb-4"
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    💡
                    <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mx-1">Ctrl + Enter</kbd> to generate</span>
                  </span>
                </div>
                
                <button
                  onClick={runAI}
                  disabled={loading}
                  className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Post
                    </>
                  )}
                </button>
              </div>

              {/* Auth Status */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"}`} />
                      <span>{puterReady ? "AI Ready" : "Connecting..."}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!signedIn ? (
                      <button
                        onClick={signInWithPuter}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300 flex items-center gap-2"
                      >
                        <LogIn className="w-3 h-3" />
                        Sign In
                      </button>
                    ) : (
                      <button
                        onClick={signOutFromPuter}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded border border-gray-300 flex items-center gap-2"
                      >
                        <LogOut className="w-3 h-3" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Copy Section */}
            {output && (
              <div className="bg-white border border-gray-300 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Copy to Clipboard</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Text
                      </>
                    )}
                  </button>
                </div>
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 overflow-y-auto max-h-60">
                  {output}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div>
            <div className="bg-white border border-gray-300 rounded-lg p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">Post Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("desktop")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      viewMode === "desktop" 
                        ? "bg-black text-white" 
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setViewMode("mobile")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      viewMode === "mobile" 
                        ? "bg-black text-white" 
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </button>
                </div>
              </div>

              {output ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  {formatPostPreview(output)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Post Preview</h4>
                  <p className="text-gray-500">
                    Your LinkedIn post will appear here after generation
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <div className="h-32 bg-gray-100 rounded-lg"></div>
                    {mode === "advanced" && (
                      <div className="h-32 bg-gray-100 rounded-lg"></div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{mode === "basic" ? "Basic Mode:" : "Advanced Mode:"}</span>
                    <span>{mode === "basic" ? "Single image post format" : "Carousel/multi-image format"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>{mode === "basic" ? "Standard engagement format" : "Viral-style with lists & stats"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-5 inline-block">
            <p className="text-gray-700 mb-3">Need help improving your post?</p>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 text-sm">
                Ask AI what to change
              </button>
              <button className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm">
                Get Post Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}