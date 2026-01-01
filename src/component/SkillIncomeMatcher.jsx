import React, { useEffect, useState } from "react";

const REMOTEOK = "https://corsproxy.io/?https://remoteok.com/api";

export default function FinalProSkillAnalyzer() {
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState([]);
  const [github, setGithub] = useState(null);
  const [reddit, setReddit] = useState(null);
  const [score, setScore] = useState(null);
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD / SAVE ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("proSkillAnalyzer");
    if (saved) {
      const d = JSON.parse(saved);
      setSkill(d.skill);
      setJobs(d.jobs);
      setGithub(d.github);
      setReddit(d.reddit);
      setScore(d.score);
      setVerdict(d.verdict);
    }
  }, []);

  useEffect(() => {
    if (score !== null) {
      localStorage.setItem(
        "proSkillAnalyzer",
        JSON.stringify({ skill, jobs, github, reddit, score, verdict })
      );
    }
  }, [skill, jobs, github, reddit, score, verdict]);

  /* ---------- MAIN LOGIC ---------- */
  const analyzeSkill = async () => {
    if (!skill) return alert("Enter a skill");
    setLoading(true);

    try {
      /* ---- Remote Jobs ---- */
      const jobRes = await fetch(REMOTEOK);
      const jobData = await jobRes.json();
      const jobList = jobData.slice(1);

      const matchedJobs = jobList.filter((job) => {
        const text =
          `${job.position} ${job.description} ${job.tags?.join(" ")}`.toLowerCase();
        return text.includes(skill.toLowerCase());
      });

      matchedJobs.sort((a, b) => (b.date || 0) - (a.date || 0));
      const latestJobs = matchedJobs.slice(0, 6);
      setJobs(latestJobs);

      /* ---- GitHub ---- */
      const gitRes = await fetch(
        `https://api.github.com/search/repositories?q=${skill}&sort=stars&order=desc`
      );
      const gitData = await gitRes.json();

      const gitScore = Math.min(gitData.total_count / 1000, 30);

      setGithub({
        repos: gitData.total_count,
        stars: gitData.items?.[0]?.stargazers_count || 0,
      });

      /* ---- Reddit ---- */
      const redRes = await fetch(
        `https://www.reddit.com/search.json?q=${skill}+jobs&limit=20`
      );
      const redData = await redRes.json();

      const redditScore = redData.data.children.length * 2;
      setReddit({ posts: redData.data.children.length });

      /* ---- FINAL SCORE ---- */
      const jobScore = Math.min(matchedJobs.length, 50);
      const finalScore = Math.min(
        Math.round(jobScore + gitScore + redditScore),
        100
      );

      setScore(finalScore);

      if (finalScore >= 75) setVerdict("🟢 STRONG CAREER SKILL");
      else if (finalScore >= 45) setVerdict("🟡 GROWING BUT COMPETITIVE");
      else setVerdict("🔴 LOW DEMAND – UPSKILL NEEDED");
    } catch (e) {
      alert("API error");
    }

    setLoading(false);
  };

  const saveSkill = () => {
    alert("⭐ Skill saved (LocalStorage)");
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Skill Market Intelligence</h1>
      <p style={styles.sub}>
        Real-time career insights using free global data
      </p>

      <input
        style={styles.input}
        placeholder="Enter any skill (React, Python, Excel, AI...)"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      <div style={styles.actions}>
        <button style={styles.primary} onClick={analyzeSkill}>
          {loading ? "Analyzing..." : "Analyze Skill"}
        </button>
        <button style={styles.secondary} onClick={saveSkill}>
          ⭐ Save
        </button>
      </div>

      {/* SCORE */}
      {score !== null && (
        <div style={styles.card}>
          <h2 style={styles.score}>{score}/100</h2>
          <p style={styles.verdict}>{verdict}</p>

          <div style={styles.meter}>
            <div
              style={{
                ...styles.meterFill,
                width: `${score}%`,
              }}
            />
          </div>

          <p style={styles.explain}>
            {skill} is evaluated using live job demand, open-source adoption,
            and community discussions.
          </p>
        </div>
      )}

      {/* JOBS */}
      {jobs.length > 0 && (
        <div style={styles.card}>
          <h3>🆕 Latest Remote Jobs</h3>
          {jobs.map((job) => (
            <div key={job.id} style={styles.job}>
              <a href={job.url} target="_blank" rel="noreferrer">
                <b>{job.position}</b>
              </a>
              <p>{job.company}</p>
              <small>{job.tags?.join(", ")}</small>
            </div>
          ))}
        </div>
      )}

      {/* GITHUB + REDDIT */}
      {(github || reddit) && (
        <div style={styles.card}>
          <h3>Market Signals</h3>
          {github && (
            <p>
              ⭐ GitHub Repositories: <b>{github.repos.toLocaleString()}</b>
            </p>
          )}
          {reddit && (
            <p>
              💬 Reddit Job Discussions: <b>{reddit.posts}</b>
            </p>
          )}
        </div>
      )}

      {/* CAREER PATH */}
      {score !== null && (
        <div style={styles.card}>
          <h3>Recommended Next Skills</h3>
          <ul>
            <li>TypeScript</li>
            <li>System Design</li>
            <li>Cloud Basics</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  wrapper: {
    maxWidth: "820px",
    margin: "40px auto",
    padding: "32px",
    background: "#f8f9fb",
    fontFamily: "Inter, sans-serif",
    textAlign: "left",
    borderRadius: "14px",
  },
  title: { marginBottom: "4px" },
  sub: { color: "#555", marginBottom: "24px" },
  input: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "12px",
  },
  actions: { display: "flex", gap: "10px", marginBottom: "24px" },
  primary: {
    background: "#000",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  secondary: {
    background: "#e5e5e5",
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
  },
  card: {
    background: "#fff",
    padding: "22px",
    borderRadius: "12px",
    marginBottom: "26px",
  },
  score: { fontSize: "40px", margin: "0" },
  verdict: { fontWeight: "600", marginBottom: "10px" },
  meter: {
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    marginBottom: "12px",
  },
  meterFill: {
    height: "100%",
    background: "#000",
    borderRadius: "10px",
  },
  explain: { color: "#555" },
  job: {
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
};
