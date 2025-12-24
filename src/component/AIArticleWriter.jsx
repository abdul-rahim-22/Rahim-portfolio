import React, { useMemo, useState, useRef, useEffect } from "react";
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
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,
  Hash,
  Smile,
  Link2,
  Maximize2,
  Minimize2,
  Edit3,
  Save,
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
  // LinkedIn Post Generator Mode
  const [mode, setMode] = useState("basic"); // basic | advanced
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [editedOutput, setEditedOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("desktop"); // desktop | mobile
  const [showEditor, setShowEditor] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("linkedin"); // linkedin | ideas | upwork

  // Puter state
  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const editorRef = useRef(null);
  const modelUsed = useMemo(() => PRIMARY_MODEL, []);

  // Formatting functions
  const formatText = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const insertText = (text) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  };

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
        system: "You are a LinkedIn post generator. Create engaging, professional LinkedIn posts. Use emojis, line breaks, and hashtags naturally.",
        user: `
Topic: ${sourceText}

Write a LinkedIn post that:
- Has a strong opening hook
- Is 4-6 paragraphs maximum
- Includes bullet points (use • character)
- Ends with 3-5 relevant hashtags
- Has a call-to-action or question
- Uses natural, conversational tone

Format with proper line breaks.
`,
        maxTokens: 800,
      };
    } else {
      // Advanced mode
      return {
        system: "You are an expert LinkedIn content creator. Create viral-style LinkedIn posts with lists, stats, and high engagement elements.",
        user: `
Topic: ${sourceText}

Create a LinkedIn post in this viral format:

**Hook:** Start with a surprising statistic or bold statement
**Problem:** Identify a common pain point
**List:** 5-7 bullet points with checkmarks (✓)
**Solution:** Brief solution
**CTA:** Clear call-to-action
**Hashtags:** 3-5 targeted hashtags

Use emojis naturally. Make it authentic and valuable.
`,
        maxTokens: 1000,
      };
    }
  };

  const runAI = async () => {
    setError("");
    setOutput("");
    setEditedOutput("");
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
      setEditedOutput(text);
      
      // Set editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = text.replace(/\n/g, '<br>');
      }
    } catch (e) {
      setError(stringifyError(e));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const text = editedOutput || output;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Please manually select and copy.");
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditedOutput(editorRef.current.innerText);
    }
  };

  const saveEditedContent = () => {
    if (editorRef.current) {
      setEditedOutput(editorRef.current.innerText);
      setOutput(editorRef.current.innerText);
    }
  };

  const onCtrlEnter = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      runAI();
    }
  };

  // Format the post preview
  const formatPostPreview = () => {
    const content = editedOutput || output;
    if (!content) return null;

    const lines = content.split('\n').filter(line => line.trim());
    
    return (
      <div className={`${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
        {/* LinkedIn Post Header */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            AR
          </div>
          <div>
            <div className="font-semibold text-gray-800">Fernando Pessagno</div>
            <div className="text-sm text-gray-600">Founder at alCarousels, the first AI Carousel Generator</div>
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
              if (line.includes('✓') || line.includes('•')) {
                return (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <span className="text-green-600 mt-1">
                      {line.includes('✓') ? '✓' : '•'}
                    </span>
                    <span>{line.replace(/[✓•]/g, '').trim()}</span>
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
            <div className="text-center">
              <div className="font-bold text-gray-800">64</div>
              <div className="text-xs text-gray-500">likes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800">27</div>
              <div className="text-xs text-gray-500">comments</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-800">4</div>
              <div className="text-xs text-gray-500">reposts</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <span className="text-gray-500 text-lg">👍</span>
              <span className="text-xs">Like</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="text-xs">Comment</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <Send className="w-5 h-5 text-gray-500" />
              <span className="text-xs">Share</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <span className="text-gray-500 text-lg">📤</span>
              <span className="text-xs">Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render LinkedIn Ideas Feature
  const renderLinkedInIdeas = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-300 rounded-lg p-5">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            LinkedIn Post Ideas Generator
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter a topic to generate 10 LinkedIn post ideas
            </label>
            <textarea
              placeholder="e.g., digital marketing, remote work, AI tools, career growth..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black resize-none"
            />
          </div>
          
          <button className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Generate 10 Ideas
          </button>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>• Each idea includes title, hook, content angle, and hashtags</p>
            <p>• Perfect for content planning</p>
            <p>• Save time on brainstorming</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Upwork Proposal Feature
  const renderUpworkProposal = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-300 rounded-lg p-5">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-700" />
            Upwork Proposal Generator
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste client job description
              </label>
              <textarea
                placeholder="Paste the client job description here..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your experience (optional)
              </label>
              <textarea
                placeholder="Describe your relevant experience..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio links (optional)
              </label>
              <textarea
                placeholder="Paste links (one per line)..."
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
              />
            </div>
          </div>
          
          <button className="mt-4 w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Proposal
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FEFDF8] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FREE LINKEDIN POST GENERATOR</h1>
          <p className="text-gray-600">Generate with AI...</p>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("linkedin")}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                activeTab === "linkedin" 
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                LinkedIn Post
              </span>
            </button>

            <button
              onClick={() => setActiveTab("ideas")}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                activeTab === "ideas" 
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                LinkedIn Ideas
              </span>
            </button>

            <button
              onClick={() => setActiveTab("upwork")}
              className={`px-4 py-3 rounded-lg text-sm font-medium ${
                activeTab === "upwork" 
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Upwork Proposal
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === "linkedin" ? (
          <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
            {/* Left Column - Input & Editor */}
            <div className={`${isFullscreen ? 'col-span-1' : ''}`}>
              {/* Mode Tabs */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode("basic")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      mode === "basic" 
                        ? "bg-black text-white" 
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Basic (1 Image)
                  </button>
                  <button
                    onClick={() => setMode("advanced")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
                  placeholder="What do you want to post about? (e.g., 'digital marketing tips', 'career advice')"
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black resize-none text-gray-700 mb-4"
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
                    <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 mx-1">Ctrl + Enter</kbd></span>
                  </div>
                  
                  <button
                    onClick={runAI}
                    disabled={loading}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2"
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
              </div>

              {/* Live Editor */}
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="border-b border-gray-300 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Live Editor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEditor(!showEditor)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showEditor ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {showEditor && (
                  <div className="p-4">
                    {/* Formatting Toolbar */}
                    <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => formatText('bold')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => formatText('italic')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => formatText('insertUnorderedList')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => formatText('insertOrderedList')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => insertText('✓ ')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Checkmark"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => insertText('#')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Hashtag"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => insertText('😊')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => insertText('🔗')}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Editor */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorChange}
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black resize-none overflow-y-auto bg-white text-gray-700 whitespace-pre-wrap"
                      placeholder="Edit your post here..."
                    />

                    {/* Editor Actions */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={saveEditedContent}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <div className="text-sm text-gray-500">
                        Characters: {(editedOutput || output).length}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Section */}
              {(output || editedOutput) && (
                <div className="mt-6 bg-white border border-gray-300 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Copy to Clipboard</h3>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm"
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
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 overflow-y-auto max-h-40">
                    {editedOutput || output}
                  </div>
                </div>
              )}

              {/* Auth Status */}
              <div className="mt-6 bg-white border border-gray-300 rounded-lg p-4">
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

            {/* Right Column - Preview (Hidden in fullscreen) */}
            {!isFullscreen && (
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

                  {(output || editedOutput) ? (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {formatPostPreview()}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Post Preview</h4>
                      <p className="text-gray-500">
                        Generated post will appear here
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-2">
                        <div className="h-32 bg-gray-100 rounded-lg"></div>
                        {mode === "advanced" && (
                          <div className="h-32 bg-gray-100 rounded-lg"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "ideas" ? (
          renderLinkedInIdeas()
        ) : (
          renderUpworkProposal()
        )}

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-5 inline-block">
            <p className="text-gray-700 mb-3">Need help improving your content?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 text-sm">
                Ask AI for suggestions
              </button>
              <button className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm">
                Get Content Insights
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}