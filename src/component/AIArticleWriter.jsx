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
  Lightbulb,
  Zap,
  MessageSquare,
  TrendingUp,
  Users,
  Target,
  BarChart,
  Heart,
  ThumbsUp,
  Share2,
  Eye,
  Calendar,
  Clock,
  Tag,
  Image as ImageIcon,
  Video,
  Link2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
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

export default function AIWriterPuterStable() {
  const [mode, setMode] = useState("linkedin"); // linkedin | linkedin-ideas | upwork
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedIdeas, setExpandedIdeas] = useState([]);

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

    if (mode === "linkedin") {
      return {
        system: "You are a top LinkedIn content creator who knows how to write viral, engaging posts. Create posts that are human, authentic, and provide real value. Focus on clarity and readability.",
        user: `
Topic / idea:
${sourceText}

Write ONE LinkedIn post with:
- A strong opening hook (first line grabs attention)
- Clear, concise paragraphs (4-6 paragraphs total)
- Practical advice or insights
- A question or call-to-action to encourage engagement
- 3-5 relevant hashtags at the end

Make it feel like a real person wrote it. Use natural language. Focus on providing value.

${common}
`,
        maxTokens: 1000,
      };
    }

    if (mode === "linkedin-ideas") {
      return {
        system: "You are a creative LinkedIn content strategist. Generate unique, engaging LinkedIn post ideas.",
        user: `
Topic / theme / keyword:
${sourceText}

Generate EXACTLY 10 creative LinkedIn post ideas. For each idea, provide in this exact format:

**Idea Title:** [Your catchy title here]  
**Core Message:** [Main takeaway in one line]  
**Hook:** [Opening line that grabs attention]  
**Content Angle:** [Unique perspective or approach]  
**Target Audience:** [Who would find this valuable?]  
**Hashtag Suggestions:** [3-5 relevant hashtags separated by spaces]  
**Visual Idea:** [What image/video/graphic would work well?]  
**Engagement Prompt:** [Question to ask audience]

Leave one blank line between each idea.

${common}
`,
        maxTokens: 2500,
      };
    }

    // upwork
    return {
      system: "You are an Upwork proposal writer. Write concise, specific proposals matching client needs.",
      user: `
Client job post / requirements:
${sourceText}

Write an Upwork proposal using this structure:

Hello [Client Name],

I can help you achieve [their exact goal] by [your approach].

From your post, you need:
- [requirement #1]
- [requirement #2]
- [requirement #3]

My plan:
1) [Step 1] → Deliverable: [deliverable]
2) [Step 2] → Deliverable: [deliverable]
3) [Step 3] → Deliverable: [deliverable]

Relevant experience:
${experience?.trim() ? experience.trim() : "[Your relevant experience]"}

Portfolio:
${portfolioLinks?.trim() ? portfolioLinks.trim() : "[Your portfolio links]"}

Quick questions:
1) [question that affects scope]
2) [question that affects timeline]

Next step: Share details, and I'll start with [first milestone].
Kind regards,
[Your Name]

${common}
`,
      maxTokens: 1100,
    };
  };

  const runAI = async () => {
    setError("");
    setOutput("");
    setCopied(false);
    setExpandedIdeas([]);

    const trimmed = input.trim();
    if (!trimmed) {
      const errorMessages = {
        "linkedin": "Please enter an idea for LinkedIn post.",
        "linkedin-ideas": "Please enter a topic for LinkedIn ideas.",
        "upwork": "Please paste the client job description."
      };
      setError(errorMessages[mode] || "Please enter some input.");
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

      const resp = await puter.ai.chat(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        false,
        {
          model: modelUsed,
          temperature: mode === "linkedin-ideas" ? 0.8 : 0.7,
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

  const toggleIdea = (index) => {
    if (expandedIdeas.includes(index)) {
      setExpandedIdeas(expandedIdeas.filter(i => i !== index));
    } else {
      setExpandedIdeas([...expandedIdeas, index]);
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

  const getTitle = () => {
    switch(mode) {
      case "linkedin": return "LinkedIn Post";
      case "linkedin-ideas": return "LinkedIn Post Ideas";
      case "upwork": return "Upwork Proposal";
      default: return "";
    }
  };

  const getPlaceholder = () => {
    switch(mode) {
      case "linkedin": 
        return "Enter your idea or topic for LinkedIn post...";
      case "linkedin-ideas":
        return "Enter a topic to generate LinkedIn post ideas...";
      case "upwork":
        return "Paste the client job description here...";
      default:
        return "";
    }
  };

  const getInputLabel = () => {
    switch(mode) {
      case "linkedin": return "Idea for LinkedIn Post";
      case "linkedin-ideas": return "Topic for Ideas";
      case "upwork": return "Client Job Description";
      default: return "";
    }
  };

  const formatOutput = (text) => {
    if (mode === "linkedin-ideas") {
      const ideas = text.split(/\n\s*\n/).filter(idea => idea.trim());
      
      return (
        <div className="space-y-4">
          {ideas.map((idea, index) => {
            const lines = idea.split('\n').filter(line => line.trim());
            const components = {};
            
            lines.forEach(line => {
              if (line.startsWith('**Idea Title:**')) {
                components.title = line.replace('**Idea Title:**', '').trim();
              } else if (line.startsWith('**Core Message:**')) {
                components.coreMessage = line.replace('**Core Message:**', '').trim();
              } else if (line.startsWith('**Hook:**')) {
                components.hook = line.replace('**Hook:**', '').trim();
              } else if (line.startsWith('**Content Angle:**')) {
                components.contentAngle = line.replace('**Content Angle:**', '').trim();
              } else if (line.startsWith('**Target Audience:**')) {
                components.targetAudience = line.replace('**Target Audience:**', '').trim();
              } else if (line.startsWith('**Hashtag Suggestions:**')) {
                components.hashtags = line.replace('**Hashtag Suggestions:**', '').trim();
              } else if (line.startsWith('**Visual Idea:**')) {
                components.visualIdea = line.replace('**Visual Idea:**', '').trim();
              } else if (line.startsWith('**Engagement Prompt:**')) {
                components.engagementPrompt = line.replace('**Engagement Prompt:**', '').trim();
              }
            });

            const isExpanded = expandedIdeas.includes(index);

            return (
              <div key={index} className="border border-gray-200 rounded-lg bg-white">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleIdea(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{components.title || `Idea ${index + 1}`}</h3>
                        <p className="text-gray-600 mt-1">{components.coreMessage || ''}</p>
                      </div>
                    </div>
                    <button className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Hook</h4>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded">"{components.hook || ''}"</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Content Angle</h4>
                        <p className="text-gray-700">{components.contentAngle || ''}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Target Audience</h4>
                        <p className="text-gray-700">{components.targetAudience || ''}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Visual Idea</h4>
                        <p className="text-gray-700">{components.visualIdea || ''}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Engagement Prompt</h4>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded">"{components.engagementPrompt || ''}"</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Hashtags</h4>
                        <div className="flex flex-wrap gap-2">
                          {components.hashtags?.split(' ').map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // LinkedIn Post
    if (mode === "linkedin") {
      const lines = text.split('\n').filter(line => line.trim());
      
      return (
        <div className="border border-gray-300 rounded-lg bg-white">
          {/* Post Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                AR
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Abdul Rahim</h3>
                <p className="text-sm text-gray-600">Web Designer & Developer</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Just now • 🌍 Public</span>
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {lines.map((line, index) => (
                <p key={index} className="mb-3 last:mb-0 text-left">
                  {line}
                </p>
              ))}
            </div>

            {/* Post Metrics */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  42 likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  12 comments
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  8 shares
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-around">
              <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                <MessageSquare className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Upwork Proposal
    return (
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {text}
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Content Generator</h1>
              <p className="text-gray-600">Create LinkedIn posts, ideas, and Upwork proposals</p>
            </div>
          </div>

          {/* Auth Status */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 mb-4">
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"}`} />
                <span>{puterReady ? "Connected" : "Connecting..."}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!signedIn ? (
                <button
                  onClick={signInWithPuter}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-2"
                >
                  <LogIn className="w-3 h-3" />
                  Sign In
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">✓ Signed in</span>
                  <button
                    onClick={signOutFromPuter}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded flex items-center gap-2"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("linkedin")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "linkedin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                LinkedIn Post
              </span>
            </button>

            <button
              onClick={() => setMode("linkedin-ideas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "linkedin-ideas" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Post Ideas
              </span>
            </button>

            <button
              onClick={() => setMode("upwork")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "upwork" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Upwork
              </span>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {getInputLabel()}
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onCtrlEnter}
            placeholder={getPlaceholder()}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700"
          />

          {/* Upwork optional fields */}
          {mode === "upwork" && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional: Your Experience
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your relevant experience..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional: Portfolio Links
                </label>
                <textarea
                  value={portfolioLinks}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  placeholder="Paste links (one per line)..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <button
            onClick={runAI}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : mode === "linkedin-ideas" ? (
              <>
                <Zap className="w-5 h-5" />
                Generate 10 Ideas
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {getTitle()}
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                {getTitle()}
              </h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="overflow-y-auto">
              {formatOutput(output)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}