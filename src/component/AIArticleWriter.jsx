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
  Image,
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

// LinkedIn post template types
const LINKEDIN_TEMPLATES = [
  {
    id: "storytelling",
    name: "Storytelling",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
    description: "Engage with personal or brand stories"
  },
  {
    id: "tips",
    name: "Tips & Tricks",
    icon: Lightbulb,
    color: "from-amber-500 to-orange-500",
    description: "Share practical advice and insights"
  },
  {
    id: "trend",
    name: "Trend Analysis",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    description: "Discuss industry trends and predictions"
  },
  {
    id: "casestudy",
    name: "Case Study",
    icon: BarChart,
    color: "from-green-500 to-emerald-500",
    description: "Showcase results with data"
  },
  {
    id: "question",
    name: "Question Poll",
    icon: Users,
    color: "from-red-500 to-rose-500",
    description: "Engage audience with questions"
  },
  {
    id: "announcement",
    name: "Announcement",
    icon: Target,
    color: "from-indigo-500 to-violet-500",
    description: "Share news and updates"
  }
];

export default function AIWriterPuterStable() {
  const [mode, setMode] = useState("linkedin"); // linkedin | linkedin-ideas | upwork
  const [input, setInput] = useState("");
  const [experience, setExperience] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("storytelling");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [puterReady, setPuterReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
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

    // Upwork mode: URL fetching disabled
    if (mode === "upwork") {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    if (!isProbablyUrl(trimmed)) {
      return { sourceText: trimmed.slice(0, 12000), fetchedFromUrl: false };
    }

    // Puter net.fetch is CORS-free (but requires SDK working properly)
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
      const templatePrompts = {
        storytelling: `Create a compelling LinkedIn storytelling post about: ${sourceText}

Follow this structure:
1. **Opening Hook** (1-2 sentences that grab attention)
2. **The Story** (3-4 paragraphs sharing a personal/professional experience)
3. **Key Lesson** (The main takeaway from the story)
4. **Actionable Insight** (Practical advice for readers)
5. **Question & Engagement** (Ask a thought-provoking question)
6. **Hashtags** (5-7 relevant hashtags)

Make it authentic, vulnerable, and relatable. Use emotions to connect with readers.`,

        tips: `Create a LinkedIn tips & tricks post about: ${sourceText}

Follow this structure:
1. **Attention-Grabbing Headline** (Start with "🚀" or "💡")
2. **Intro** (Why this topic matters)
3. **Tips List** (5-7 actionable tips, each with explanation)
4. **Pro Tip** (One advanced insight)
5. **Implementation Advice** (How to apply these tips)
6. **Call to Action** (Encourage sharing or trying)
7. **Hashtags** (5-7 relevant hashtags)

Make each tip practical, specific, and valuable. Use emojis for visual appeal.`,

        trend: `Create a LinkedIn trend analysis post about: ${sourceText}

Follow this structure:
1. **Trend Statement** (What's changing/emerging)
2. **Why It Matters** (Impact on industry/business)
3. **Current State Analysis** (Data/observations)
4. **Future Predictions** (3-5 predictions for next 1-2 years)
5. **Action Steps** (How to prepare/adapt)
6. **Discussion Starter** (Question about the trend)
7. **Hashtags** (5-7 trend-related hashtags)

Use data points where possible. Be insightful, not speculative.`,

        casestudy: `Create a LinkedIn case study post about: ${sourceText}

Follow this structure:
1. **Challenge** (What problem was solved)
2. **Approach** (Strategy/methodology used)
3. **Implementation** (Key steps taken)
4. **Results** (Quantifiable outcomes with numbers)
5. **Key Learnings** (3-5 insights gained)
6. **Replication Advice** (How others can achieve similar results)
7. **Hashtags** (5-7 relevant hashtags)

Focus on specific metrics (%, $, time saved). Be transparent about challenges too.`,

        question: `Create a LinkedIn question/poll post about: ${sourceText}

Follow this structure:
1. **Engaging Question** (Start with "What if...", "How do you...", "Which is better...")
2. **Context** (Why this question matters)
3. **Options** (3-4 clear options for discussion/poll)
4. **Your Take** (Share your perspective briefly)
5. **Encourage Comments** (Ask for experiences/opinions)
6. **Value Add** (Promise to share insights from responses)
7. **Hashtags** (5-7 discussion hashtags)

Make it interactive and easy to respond to. Encourage diverse perspectives.`,

        announcement: `Create a LinkedIn announcement post about: ${sourceText}

Follow this structure:
1. **Big News Hook** (Start with exciting announcement)
2. **Details** (What, when, where, why)
3. **Impact** (Who benefits and how)
4. **Journey** (Brief backstory if relevant)
5. **Thank Yous** (Acknowledge contributors)
6. **Next Steps** (What happens now)
7. **Invitation** (Ask for support/engagement)
8. **Hashtags** (5-7 relevant hashtags)

Use celebratory tone. Include team mentions if applicable.`
      };

      return {
        system: "You are a top LinkedIn content creator who knows how to write viral, engaging posts. You understand LinkedIn algorithms and what makes content perform well.",
        user: templatePrompts[selectedTemplate] || templatePrompts.storytelling,
        maxTokens: 1200,
      };
    }

    if (mode === "linkedin-ideas") {
      return {
        system: "You are a creative LinkedIn content strategist. Generate unique, engaging LinkedIn post ideas that are creative, thought-provoking, and share-worthy.",
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

Leave one blank line between each idea. Make ideas diverse, practical, and LinkedIn-friendly.

Rules:
- Start each idea with "**Idea Title:**" on the first line
- Each field should be on its own line
- Do not use bullet points or numbered lists
- Keep each idea concise and focused
- Include different formats (tips, stories, questions, lists, etc.)
- Keep professional but human tone

${common}
`,
        maxTokens: 2500,
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

  const runAI = async () => {
    setError("");
    setOutput("");
    setCopied(false);
    setExpandedIdeas([]);

    const trimmed = input.trim();
    if (!trimmed) {
      const errorMessages = {
        "linkedin": "Please enter an idea, a URL, or source text for LinkedIn post.",
        "linkedin-ideas": "Please enter a topic, theme, or keyword for LinkedIn ideas.",
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch {
      setError("Copy failed. Please manually select and copy.");
    }
  };

  const formatLinkedInPost = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const hashtags = lines.filter(line => line.includes('#')).join(' ');
    const content = lines.filter(line => !line.includes('#')).join('\n');
    
    return { content, hashtags };
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
        return "Enter an idea OR paste a public URL OR paste source text for LinkedIn post...";
      case "linkedin-ideas":
        return "Enter a topic, theme, or keyword to generate creative LinkedIn post ideas (e.g., 'digital marketing', 'remote work', 'AI tools', 'career growth')...";
      case "upwork":
        return "Paste the client job description here...";
      default:
        return "";
    }
  };

  const getInputLabel = () => {
    switch(mode) {
      case "linkedin": return "Idea / URL / Source Text";
      case "linkedin-ideas": return "Topic / Theme / Keyword";
      case "upwork": return "Client Job Description";
      default: return "";
    }
  };

  const formatOutput = (text) => {
    if (mode === "linkedin-ideas") {
      const ideas = text.split(/\n\s*\n/).filter(idea => idea.trim());
      
      return (
        <div className="space-y-6">
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
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div 
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleIdea(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{components.title || `Idea ${index + 1}`}</h3>
                        <p className="text-gray-600 mt-1">{components.coreMessage || ''}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {components.targetAudience?.split(',')[0] || 'Professionals'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {components.hashtags?.split(' ')[0] || '#LinkedIn'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            Hook
                          </h4>
                          <p className="text-gray-800 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                            "{components.hook || ''}"
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Content Angle
                          </h4>
                          <p className="text-gray-700 p-3 bg-amber-50 rounded-lg">
                            {components.contentAngle || ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <Image className="w-4 h-4 text-indigo-500" />
                            Visual Idea
                          </h4>
                          <p className="text-gray-700 p-3 bg-indigo-50 rounded-lg">
                            {components.visualIdea || ''}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-500" />
                            Engagement Prompt
                          </h4>
                          <p className="text-gray-800 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            "{components.engagementPrompt || ''}"
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {components.hashtags?.split(' ').map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
                            {tag}
                          </span>
                        ))}
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

    if (mode === "linkedin") {
      const { content, hashtags } = formatLinkedInPost(text);
      const template = LINKEDIN_TEMPLATES.find(t => t.id === selectedTemplate);
      const TemplateIcon = template?.icon || MessageSquare;

      return (
        <div className="space-y-6">
          {/* Template Badge */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${template?.color}`}>
                <TemplateIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{template?.name} Template</h3>
                <p className="text-sm text-gray-600">{template?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* LinkedIn Post Preview */}
          <div className="border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-lg">
            {/* Post Header */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  AR
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Abdul Rahim</h3>
                  <p className="text-sm text-gray-600">Web Designer & Developer • Sharing insights on digital creativity</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Just now • 🌍 Public</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-5">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-[15px]">
                  {content}
                </div>
                
                {/* Hashtags */}
                {hashtags && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {hashtags.split('#').filter(tag => tag.trim()).map((tag, index) => (
                        <span key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement Metrics Preview */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-blue-500" />
                      <span>42</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <span>12</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4 text-purple-500" />
                      <span>8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-amber-500" />
                      <span>1.2K views</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Estimated engagement
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-around">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <ThumbsUp className="w-5 h-5" />
                  <span>Like</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <MessageSquare className="w-5 h-5" />
                  <span>Comment</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <Heart className="w-5 h-5" />
                  <span>Celebrate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Copy Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">Ready to Post Text</h4>
              <button
                onClick={() => copyToClipboard(text)}
                className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Full Text
              </button>
            </div>
            <div className="relative">
              <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {text}
              </pre>
              {showCopied && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm animate-pulse">
                  ✓ Copied!
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Upwork or default output
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-800">Upwork Proposal</h4>
          </div>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-white p-4 rounded-lg border">
            {text}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Content Creation Studio
                </h1>
                <p className="text-gray-600 text-sm">Generate engaging content for LinkedIn & professional platforms</p>
              </div>
            </div>

            {/* Auth Status */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <div className="text-sm text-gray-700">
                  <span className={`inline-block w-2 h-2 rounded-full ${puterReady ? "bg-green-500" : "bg-gray-300"} mr-2`} />
                  {puterReady ? "API Ready" : "Connecting..."}
                </div>
                <div className="text-xs text-gray-500">
                  {signedIn ? "✓ Signed in" : "Sign in to start"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={signInWithPuter}
                  className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  {signedIn ? "Refresh" : "Sign In"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Input & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "linkedin", icon: FileText, label: "LinkedIn Post", color: "purple" },
                  { id: "linkedin-ideas", icon: Lightbulb, label: "Post Ideas", color: "yellow" },
                  { id: "upwork", icon: Briefcase, label: "Upwork Proposal", color: "blue" }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMode(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-md` 
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-sm"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Selector for LinkedIn */}
            {mode === "linkedin" && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  Select Post Template
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LINKEDIN_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? `border-2 border-purple-500 bg-gradient-to-br ${template.color} bg-opacity-10` 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className={`font-semibold ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{template.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                {mode === "linkedin" && <FileText className="w-5 h-5 text-purple-600" />}
                {mode === "linkedin-ideas" && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                {mode === "upwork" && <Briefcase className="w-5 h-5 text-blue-600" />}
                {getInputLabel()}
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onCtrlEnter}
                placeholder={getPlaceholder()}
                className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-400 focus:border-transparent resize-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
              />

              {/* Upwork optional fields */}
              {mode === "upwork" && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Optional: Your Experience
                    </label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Example: I build WordPress tools, forms, custom plugins, etc."
                      className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-gray-700"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-blue-600" />
                      Optional: Portfolio Links
                    </label>
                    <textarea
                      value={portfolioLinks}
                      onChange={(e) => setPortfolioLinks(e.target.value)}
                      placeholder="Paste links (one per line)."
                      className="w-full h-24 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-gray-700"
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

              <div className="mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <span className="hidden sm:inline">💡</span>
                      <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl + Enter</kbd> to generate</span>
                    </span>
                  </div>
                  <button
                    onClick={runAI}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-3 shadow-lg disabled:shadow-none min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating {getTitle()}...
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
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Check className="w-6 h-6 text-green-600" />
                    {getTitle()}
                    {mode === "linkedin-ideas" && (
                      <span className="ml-auto text-sm font-normal bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 px-3 py-1 rounded-full">
                        10 Ideas
                      </span>
                    )}
                  </h2>
                </div>

                <div className="p-5">
                  {output ? (
                    <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                      {formatOutput(output)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Output Preview</h3>
                      <p className="text-gray-500 text-sm">
                        Your generated content will appear here. Start by entering your idea above.
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                          { text: "Digital Marketing Tips", color: "bg-purple-100 text-purple-700" },
                          { text: "AI Tools Review", color: "bg-blue-100 text-blue-700" },
                          { text: "Career Growth", color: "bg-green-100 text-green-700" },
                          { text: "Remote Work", color: "bg-amber-100 text-amber-700" },
                        ].map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(example.text)}
                            className={`text-xs px-3 py-2 rounded-lg ${example.color} hover:opacity-90 transition-opacity`}
                          >
                            {example.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}