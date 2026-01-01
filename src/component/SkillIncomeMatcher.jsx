import React, { useState } from "react";

const REMOTEOK = "https://corsproxy.io/?https://remoteok.com/api";

/* ---------- CATEGORY MAP ---------- */
const CATEGORY_MAP = {
  marketing: ["SEO", "Content Marketing"],
  frontend: ["Angular", "Vue"],
  backend: ["Node.js", "Java"],
  programming: ["Java", "C++"],
  data: ["Data Analyst", "Machine Learning"],
};

/* ---------- DETECT CATEGORY ---------- */
function detectCategory(skill) {
  const s = skill.toLowerCase();
  if (s.includes("social") || s.includes("marketing")) return "marketing";
  if (s.includes("react") || s.includes("frontend")) return "frontend";
  if (s.includes("node") || s.includes("backend")) return "backend";
  if (s.includes("python") || s.includes("data")) return "data";
  return "programming";
}

/* ---------- ANALYZE SKILL ---------- */
async function analyzeSkill(skill) {
  /* Jobs */
  const jobRes = await fetch(REMOTEOK);
  const jobData = await jobRes.json();
  const jobList = jobData.slice(1);

  const matchedJobs = jobList.filter((job) =>
    `${job.position} ${job.description} ${job.tags?.join(" ")}`
      .toLowerCase()
      .includes(skill.toLowerCase())
  );

  /* GitHub */
  const gitRes = await fetch(
    `https://api.github.com/search/repositories?q=${skill}&sort=stars`
  );
  const gitData = await gitRes.json();
  const topRepos = (gitData.items || []).slice(0, 3).map((r) => ({
    name: r.full_name,
    url: r.html_url,
    stars: r.stargazers_count,
  }));

  /* Reddit */
  let redditPosts = [];
  try {
    const redRes = await fetch(
      `https://corsproxy.io/?https://www.reddit.com/search.json?q=${skill}+jobs&limit=5`
    );
    const redData = await redRes.json();
    redditPosts = redData.data.children.map((p) => ({
      title: p.data.title,
      url: "https://reddit.com" + p.data.permalink,
    }));
  } catch {}

  /* Score */
  const score = Math.min(
    Math.round(
      Math.min(matchedJobs.length, 50) +
        Math.min(gitData.total_count / 1000, 30) +
        redditPosts.length * 4
    ),
    100
  );

  return {
    skill,
    score,
    jobs: matchedJobs.slice(0, 5),
    repos: topRepos,
    reddit: redditPosts,
  };
}

/* ---------- MAIN COMPONENT ---------- */
export default function AutoSkillComparisonPro() {
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!skill) return alert("Enter a skill");
    setLoading(true);

    const category = detectCategory(skill);
    const competitors = CATEGORY_MAP[category] || [];

    const allSkills = [skill, ...competitors];

    const analyzed = [];
    for (const s of allSkills) {
      analyzed.push(await analyzeSkill(s));
    }

    setResults(analyzed);
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <h1>Auto Skill Comparison</h1>
      <p style={styles.sub}>
        Enter one skill — we automatically compare it with market alternatives
      </p>

      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="e.g. Social Media, React, Python"
        style={styles.input}
      />

      <button onClick={run} style={styles.btn}>
        {loading ? "Analyzing..." : "Analyze & Compare"}
      </button>

      <div style={styles.grid}>
        {results.map((r, i) => (
          <div key={i} style={styles.card}>
            <h2>{r.skill}</h2>
            <h1>{r.score}/100</h1>

            <h4>💼 Jobs</h4>
            {r.jobs.map((j) => (
              <a key={j.id} href={j.url} target="_blank" rel="noreferrer">
                {j.position}
              </a>
            ))}

            <h4>⭐ GitHub Repos</h4>
            {r.repos.map((repo, i) => (
              <a key={i} href={repo.url} target="_blank" rel="noreferrer">
                {repo.name} ({repo.stars}★)
              </a>
            ))}

            <h4>💬 Reddit Posts</h4>
            {r.reddit.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer">
                {p.title}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  wrapper: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "32px",
    background: "#f8f9fb",
    fontFamily: "Inter, sans-serif",
    textAlign: "left",
    borderRadius: "14px",
  },
  sub: { color: "#555", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "12px",
  },
  btn: {
    background: "#000",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
};
