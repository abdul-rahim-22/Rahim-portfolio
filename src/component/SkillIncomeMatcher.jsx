import React, { useState } from "react";

const REMOTEOK = "https://corsproxy.io/?https://remoteok.com/api";

async function analyzeSkill(skill) {
  /* -------- Remote Jobs -------- */
  const jobRes = await fetch(REMOTEOK);
  const jobData = await jobRes.json();
  const jobList = jobData.slice(1);

  const matchedJobs = jobList.filter((job) => {
    const text =
      `${job.position} ${job.description} ${job.tags?.join(" ")}`.toLowerCase();
    return text.includes(skill.toLowerCase());
  });

  /* -------- GitHub -------- */
  const gitRes = await fetch(
    `https://api.github.com/search/repositories?q=${skill}&sort=stars&order=desc`
  );
  const gitData = await gitRes.json();

  /* -------- Reddit (CORS SAFE) -------- */
  let redditPosts = 0;
  try {
    const redRes = await fetch(
      `https://corsproxy.io/?https://www.reddit.com/search.json?q=${skill}+jobs&limit=20`
    );
    const redData = await redRes.json();
    redditPosts = redData.data.children.length;
  } catch {}

  /* -------- Score -------- */
  const jobScore = Math.min(matchedJobs.length, 50);
  const gitScore = Math.min(gitData.total_count / 1000, 30);
  const redditScore = redditPosts * 2;

  const score = Math.min(
    Math.round(jobScore + gitScore + redditScore),
    100
  );

  let verdict = "🔴 Low Demand";
  if (score >= 75) verdict = "🟢 Strong Career Skill";
  else if (score >= 45) verdict = "🟡 Growing but Competitive";

  return {
    skill,
    jobs: matchedJobs.length,
    github: gitData.total_count,
    reddit: redditPosts,
    score,
    verdict,
  };
}

export default function SkillComparisonPro() {
  const [skillA, setSkillA] = useState("");
  const [skillB, setSkillB] = useState("");
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    if (!skillA || !skillB) return alert("Enter both skills");
    setLoading(true);

    const a = await analyzeSkill(skillA);
    const b = await analyzeSkill(skillB);

    setDataA(a);
    setDataB(b);

    localStorage.setItem(
      "skillComparison",
      JSON.stringify({ a, b })
    );

    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <h1>Skill Comparison</h1>
      <p style={styles.sub}>
        Compare two skills using real market data
      </p>

      <div style={styles.inputs}>
        <input
          placeholder="Skill A (e.g. React)"
          value={skillA}
          onChange={(e) => setSkillA(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Skill B (e.g. Angular)"
          value={skillB}
          onChange={(e) => setSkillB(e.target.value)}
          style={styles.input}
        />
      </div>

      <button onClick={compare} style={styles.btn}>
        {loading ? "Comparing..." : "Compare Skills"}
      </button>

      {(dataA && dataB) && (
        <div style={styles.grid}>
          {[dataA, dataB].map((d, i) => (
            <div key={i} style={styles.card}>
              <h2>{d.skill}</h2>
              <h1>{d.score}/100</h1>
              <p>{d.verdict}</p>

              <div style={styles.bar}>
                <div
                  style={{
                    ...styles.barFill,
                    width: `${d.score}%`,
                  }}
                />
              </div>

              <p>💼 Jobs: {d.jobs}</p>
              <p>⭐ GitHub Repos: {d.github.toLocaleString()}</p>
              <p>💬 Reddit Posts: {d.reddit}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  wrapper: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "30px",
    background: "#f8f9fb",
    fontFamily: "Inter, sans-serif",
    textAlign: "left",
    borderRadius: "14px",
  },
  sub: { color: "#555", marginBottom: "20px" },
  inputs: { display: "flex", gap: "12px", marginBottom: "12px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
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
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
  },
  bar: {
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    marginBottom: "12px",
  },
  barFill: {
    height: "100%",
    background: "#000",
    borderRadius: "10px",
  },
};
