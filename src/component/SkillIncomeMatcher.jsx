import React, { useState } from "react";

const REMOTEOK = "https://corsproxy.io/?https://remoteok.com/api";

export default function SkillAndCVDashboard() {
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cvText, setCvText] = useState("");
  const [cvFeedback, setCvFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------- SKILL RESEARCH -------- */
  const researchSkill = async () => {
    if (!skill) return alert("Enter a skill");
    setLoading(true);

    try {
      const jobRes = await fetch(REMOTEOK);
      const jobData = await jobRes.json();
      const jobList = jobData.slice(1);

      const matchedJobs = jobList.filter((job) =>
        `${job.position} ${job.description} ${job.tags?.join(" ")}`
          .toLowerCase()
          .includes(skill.toLowerCase())
      );

      setJobs(matchedJobs.slice(0, 6));
    } catch {
      setJobs([]);
    }

    try {
      const redRes = await fetch(
        `https://corsproxy.io/?https://www.reddit.com/search.json?q=${skill}+jobs&limit=6`
      );
      const redData = await redRes.json();
      setPosts(
        redData.data.children.map((p) => ({
          title: p.data.title,
          url: "https://reddit.com" + p.data.permalink,
        }))
      );
    } catch {
      setPosts([]);
    }

    setLoading(false);
  };

  /* -------- CV UPLOAD -------- */
  const handleCVUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCvText(text);
      analyzeCV(text);
    };
    reader.readAsText(file);
  };

  /* -------- CV ANALYSIS -------- */
  const analyzeCV = (text) => {
    const feedback = [];
    const lower = text.toLowerCase();

    if (!lower.includes("summary") && !lower.includes("profile")) {
      feedback.push("❗ Add a professional summary at the top.");
    }

    if (!lower.includes("skills")) {
      feedback.push("❗ Skills section missing. Recruiters scan skills first.");
    }

    if (!lower.includes("experience")) {
      feedback.push("❗ Work experience section not found.");
    }

    if (!lower.includes("project")) {
      feedback.push("⭐ Add projects to strengthen your profile.");
    }

    if (text.length < 1500) {
      feedback.push("⚠️ CV looks too short. Add more details.");
    }

    if (text.length > 6000) {
      feedback.push("⚠️ CV is too long. Keep it concise (1–2 pages).");
    }

    if (!lower.match(/\b\d+%|\b\d+\+|\b\d+ years/)) {
      feedback.push(
        "⭐ Add numbers (%, years, results) to show impact."
      );
    }

    setCvFeedback(feedback);
  };

  return (
    <div style={styles.page}>
      <h1>Professional Skill & CV Dashboard</h1>
      <p style={styles.subtitle}>
        Real job market data + resume quality analysis
      </p>

      {/* SKILL INPUT */}
      <input
        style={styles.input}
        placeholder="Enter a skill (e.g. Social Media, React, Python)"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      <button style={styles.button} onClick={researchSkill}>
        {loading ? "Loading…" : "Research Skill"}
      </button>

      {/* JOBS */}
      {jobs.length > 0 && (
        <section style={styles.section}>
          <h2>Live Remote Jobs</h2>
          {jobs.map((job) => (
            <div key={job.id} style={styles.item}>
              <a href={job.url} target="_blank" rel="noreferrer">
                <strong>{job.position}</strong>
              </a>
              <div>{job.company}</div>
              <small>{job.tags?.join(", ")}</small>
            </div>
          ))}
        </section>
      )}

      {/* REDDIT */}
      {posts.length > 0 && (
        <section style={styles.section}>
          <h2>Community Discussions</h2>
          {posts.map((p, i) => (
            <div key={i} style={styles.item}>
              <a href={p.url} target="_blank" rel="noreferrer">
                {p.title}
              </a>
            </div>
          ))}
        </section>
      )}

      {/* CV UPLOAD */}
      <section style={styles.section}>
        <h2>CV Analysis</h2>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => handleCVUpload(e.target.files[0])}
        />
      </section>

      {/* CV FEEDBACK */}
      {cvFeedback.length > 0 && (
        <section style={styles.section}>
          <h2>CV Improvement Suggestions</h2>
          <ul>
            {cvFeedback.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* -------- STYLES -------- */
const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "32px",
    fontFamily: "Inter, system-ui, sans-serif",
    textAlign: "left",
    background: "#fff",
  },
  subtitle: { color: "#555", marginBottom: "24px" },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "12px",
  },
  button: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "30px",
  },
  section: { marginBottom: "40px" },
  item: {
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
};
