import React, { useMemo, useState } from "react";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Link as LinkIcon,
  FileText,
  Briefcase,
  Code,
  Terminal,
  Bug,
} from "lucide-react";

const PRIMARY_MODEL = "allenai/olmo-31b-instruct-think";
const OPENROUTER_API_KEY = "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";

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
  const content = resp?.choices?.[0]?.message?.content;
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

// OpenRouter API helper function
async function callOpenRouterAPI(messages, model, temperature, maxTokens) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.hostname || "localhost",
      "X-Title": "AI Writer Puter Stable"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Debug helper: find coding errors
function findCodingErrors(text) {
  const errors = [];
  const lines = text.split('\n');
  
  // Common JavaScript/HTML errors
  const errorPatterns = [
    { pattern: /console\.log/g, description: "Console.log statements found", severity: "warning" },
    { pattern: /debugger/g, description: "Debugger statements found", severity: "warning" },
    { pattern: /==[^=]/g, description: "Use === instead of == for comparison", severity: "error" },
    { pattern: /<[^>]*$/g, description: "Unclosed HTML tags", severity: "error" },
    { pattern: /^[^<]*<\/[^>]+>/g, description: "HTML tag without opening tag", severity: "error" },
    { pattern: /<script[^>]*>.*?<\/script>/gis, description: "Inline script tags detected", severity: "warning" },
    { pattern: /<style[^>]*>.*?<\/style>/gis, description: "Inline style tags detected", severity: "warning" },
    { pattern: /onclick\s*=/gi, description: "Inline onclick handlers", severity: "warning" },
    { pattern: /href\s*=\s*["']javascript:/gi, description: "JavaScript href links", severity: "error" },
    { pattern: /<a[^>]*href\s*=\s*["'][^"']*["'][^>]*>/gi, description: "External links without target='_blank'", severity: "info" },
    { pattern: /<input[^>]*type\s*=\s*["']submit["'][^>]*>/gi, description: "Submit buttons should have form attribute", severity: "info" },
    { pattern: /<form[^>]*>[^<]*(?!<\/form>)/gi, description: "Form without closing tag", severity: "error" },
    { pattern: /class\s*=\s*["'][^"']*["'][^>]*>/gi, description: "Missing class attribute", severity: "info" },
    { pattern: /id\s*=\s*["'][^"']*["'][^>]*>/gi, description: "Missing id attribute", severity: "info" },
    { pattern: /alt\s*=\s*["'][^"']*["'][^>]*>/gi, description: "Missing alt attribute for images", severity: "error" },
    { pattern: /<img[^>]*(?!alt\s*=\s*["'])/gi, description: "Image without alt attribute", severity: "error" },
    { pattern: /<video[^>]*(?!controls)/gi, description: "Video without controls", severity: "info" },
    { pattern: /<audio[^>]*(?!controls)/gi, description: "Audio without controls", severity: "info" },
    { pattern: /<label[^>]*>[^<]*(?!<\/label>)/gi, description: "Label without closing tag", severity: "error" },
    { pattern: /<button[^>]*>[^<]*(?!<\/button>)/gi, description: "Button without closing tag", severity: "error" },
    { pattern: /<div[^>]*>[^<]*(?!<\/div>)/gi, description: "Div without closing tag", severity: "error" },
    { pattern: /<span[^>]*>[^<]*(?!<\/span>)/gi, description: "Span without closing tag", severity: "error" },
    { pattern: /<p[^>]*>[^<]*(?!<\/p>)/gi, description: "Paragraph without closing tag", severity: "error" },
    { pattern: /<h[1-6][^>]*>[^<]*(?!<\/h[1-6]>)/gi, description: "Heading without closing tag", severity: "error" },
    { pattern: /<li[^>]*>[^<]*(?!<\/li>)/gi, description: "List item without closing tag", severity: "error" },
    { pattern: /<ul[^>]*>[^<]*(?!<\/ul>)/gi, description: "Unordered list without closing tag", severity: "error" },
    { pattern: /<ol[^>]*>[^<]*(?!<\/ol>)/gi, description: "Ordered list without closing tag", severity: "error" },
    { pattern: /<table[^>]*>[^<]*(?!<\/table>)/gi, description: "Table without closing tag", severity: "error" },
    { pattern: /<tr[^>]*>[^<]*(?!<\/tr>)/gi, description: "Table row without closing tag", severity: "error" },
    { pattern: /<td[^>]*>[^<]*(?!<\/td>)/gi, description: "Table cell without closing tag", severity: "error" },
    { pattern: /<th[^>]*>[^<]*(?!<\/th>)/gi, description: "Table header without closing tag", severity: "error" },
    { pattern: /<form[^>]*>[^<]*(?!<\/form>)/gi, description: "Form without closing tag", severity: "error" },
    { pattern: /<input[^>]*type\s*=\s*["']text["'][^>]*>/gi, description: "Input without label", severity: "warning" },
    { pattern: /<input[^>]*type\s*=\s*["']email["'][^>]*>/gi, description: "Email input without validation", severity: "warning" },
    { pattern: /<input[^>]*type\s*=\s*["']password["'][^>]*>/gi, description: "Password input without validation", severity: "warning" },
    { pattern: /<input[^>]*type\s*=\s*["']number["'][^>]*>/gi, description: "Number input without min/max", severity: "warning" },
    { pattern: /<input[^>]*type\s*=\s*["']date["'][^>]*>/gi, description: "Date input without validation", severity: "warning" },
    { pattern: /<input[^>]*type\s*=\s*["']file["'][^>]*>/gi, description: "File input without accept attribute", severity: "warning" },
    { pattern: /<a[^>]*href\s*=\s*["']#["'][^>]*>/gi, description: "Link with hash href", severity: "warning" },
    { pattern: /<a[^>]*href\s*=\s*["'][^"']*\.[a-z]{2,}["'][^>]*>/gi, description: "External link without rel='noopener'", severity: "warning" },
    { pattern: /<meta[^>]*>/gi, description: "Missing meta tags", severity: "info" },
    { pattern: /<title[^>]*>/gi, description: "Missing page title", severity: "info" },
    { pattern: /<body[^>]*>/gi, description: "Missing body tag", severity: "info" },
    { pattern: /<head[^>]*>/gi, description: "Missing head tag", severity: "info" },
    { pattern: /<html[^>]*>/gi, description: "Missing html tag", severity: "info" },
  ];

  lines.forEach((line, index) => {
    errorPatterns.forEach(({ pattern, description, severity }) => {
      const matches = line.match(pattern);
      if (matches) {
        errors.push({
          line: index + 1,
          column: line.search(pattern) + 1,
          message: description,
          severity: severity,
          code: line.trim()
        });
      }
    });
  });

  return errors;
}

export default function AIWriterPuterStable() {
  const [mode, setMode] = useState("article"); // article | linkedin | upwork | debug
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [debugResult, setDebugResult] = useState([]);

  const modelUsed = useMemo(() => PRIMARY_MODEL, []);

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

    if (mode === "upwork") {
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
    }

    // debug mode
    return { system: "", user: "", maxTokens: 1 };
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
      const { sourceText } = await maybeFetchUrlText(trimmed);
      const { system, user, maxTokens } = buildPrompts(sourceText);

      if (mode === "debug") {
        // Debug mode: find coding errors
        const errors = findCodingErrors(sourceText);
        setDebugResult(errors);
        setLoading(false);
        return;
      }

      // Use OpenRouter API
      const response = await callOpenRouterAPI(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        modelUsed,
        0.6,
        maxTokens
      );

      let text = extractChatText(response);
      if (!text) throw new Error("Empty response from AI. Please try again.");

      // Article strict word count fix once
      if (mode === "article") {
        const wc = wordCount(text);
        if (wc < 800 || wc > 1000) {
          const response2 = await callOpenRouterAPI(
            [
              { role: "system", content: system },
              {
                role: "user",
                content: `Rewrite the article to be STRICTLY 800–1000 words. Keep exact structure. Here is draft:\n\n${text}`,
              },
            ],
            modelUsed,
            0.4,
            1900
          );

          const fixed = extractChatText(response2);
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

  const maybeFetchUrlText = async (raw) => {
    const trimmed = raw.trim();

    // Upwork mode: URL fetching disabled
    if (mode === "upwork") {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    if (!isProbablyUrl(trimmed)) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    // Fetch URL content using fetch API
    try {
      const response = await fetch(trimmed);
      const html = await response.text();
      const text = htmlToReadableText(html);

      return {
        sourceText: `URL: ${trimmed}\n\nPAGE TEXT:\n${text.slice(0, 12000)}`,
        fetchedFromUrl: true,
      };
    } catch (error) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }
  };

  const onCtrlEnter = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      runAI();
    }
  };

  return (
    <div className="min-h-screen bg-[#EFFDE8] p-4 sm:p-6">
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

          {mode !== "upwork" && mode !== "debug" && (
            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Paste a public URL to auto-fetch page text.
            </p>
          )}
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

            <button
              onClick={() => setMode("debug")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "debug" ? "bg-purple-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Bug className="w-4 h-4 mr-1 inline" />
              Debug Code
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            {mode === "upwork" 
              ? "Client Job Description" 
              : mode === "debug"
              ? "Code to Debug"
              : "Topic / URL / Source Text"}
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onCtrlEnter}
            placeholder={
              mode === "upwork" 
                ? "Paste the client job description here..." 
                : mode === "debug"
                ? "Paste your HTML/CSS/JavaScript code here to find errors..."
                : "Enter a topic OR paste a public URL OR paste source text..."
            }
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

        {/* Debug Results */}
        {mode === "debug" && debugResult.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-600" />
                Debug Results
              </h3>
              <span className="text-sm text-gray-600">{debugResult.length} errors found</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {debugResult.map((error, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  error.severity === 'error' ? 'bg-red-50 border-red-500' :
                  error.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          error.severity === 'error' ? 'bg-red-500' :
                          error.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm font-semibold text-gray-800">{error.message}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          error.severity === 'error' ? 'bg-red-100 text-red-800' :
                          error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {error.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Line {error.line}, Column {error.column}
                      </div>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        {error.code}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
