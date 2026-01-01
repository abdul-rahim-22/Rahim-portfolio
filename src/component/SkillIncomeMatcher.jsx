import React, { useEffect, useState } from "react";

const API = "https://corsproxy.io/?https://remoteok.com/api";

export default function AdvancedSkillDemand() {
  const [skills, setSkills] = useState("");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved
  useEffect(() => {
    const saved = localStorage.getItem("advancedSkillDemand");
    if (saved) {
      const parsed = JSON.parse(saved);
      setJobs(parsed.jobs);
      setStats(parsed.stats);
    }
  }, []);

  // Save
  useEffect(() => {
    if (stats) {
      localStorage.setItem(
        "advancedSkillDemand",
        JSON.stringify({ jobs, stats })
      );
    }
  }, [jobs, stats]);

  const analyze = async () => {
    if (!skills) return alert("Enter skills");

    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      const jobList = data.slice(1);

      const skillArray = skills
        .split(",")
        .map((s) => s.trim().toLowerCase());

      const matched = jobList.filter((job) => {
        const text = `${job.position} ${job.description} ${job.tags?.join(" ")}`.toLowerCase();
        return skillArray.some((s) => text.includes(s));
      });

      matched.sort((a, b) => (b.date || 0) - (a.date || 0));

      const demandLevel =
        matched.length > 80
          ? "Very High"
          : matched.length > 40
          ? "High"
          : matched.length > 15
          ? "Medium"
          : "Low";

      setStats({
        skills: skillArray,
        totalJobs: matched.length,
        demand: demandLevel,
        checkedAt: new Date().toLocaleString(),
      });

      setJobs(matched.slice(0, 10));
    } catch {
      alert("API error");
    }
    setLoading(false);
  };

  const clearAll = () => {
    localStorage.removeItem("advancedSkillDemand");
    setJobs([]);
    setStats(null);
    setSkills("");
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Skill Demand Analyzer</h1>
      <p style={styles.subtitle}>
        Check real global remote job demand for any skill using live market data.
      </p>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Enter Skills</label>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. React, Python, Excel"
          style={styles.input}
        />
        <small style={styles.hint}>
          Separate multiple skills with commas
        </small>
      </div>

      <div style={styles.actions}>
        <button onClick={analyze} style={styles.primaryBtn}>
          {loading ? "Analyzing..." : "Analyze Market"}
        </button>
        <button onClick={clearAll} style={styles.secondaryBtn}>
          Clear
        </button>
      </div>

      {stats && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Market Summary</h3>
          <p><b>Skills:</b> {stats.skills.join(", ")}</p>
          <p><b>Total Jobs:</b> {stats.totalJobs}</p>
          <p><b>Demand Level:</b> {stats.demand}</p>
          <p><b>Last Updated:</b> {stats.checkedAt}</p>

          <div style={styles.bar}>
            <div
              style={{
                ...styles.barFill,
                width:
                  stats.totalJobs > 80
                    ? "100%"
                    : stats.totalJobs > 40
                    ? "70%"
                    : stats.totalJobs > 15
                    ? "40%"
                    : "20%",
              }}
            />
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Latest Job Openings</h3>
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
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "30px",
    fontFamily: "Inter, sans-serif",
    background: "#f8f9fb",
    color: "#111",
    textAlign: "left",
    borderRadius: "12px",
  },
  title: { marginBottom: "5px" },
  subtitle: { marginBottom: "25px", color: "#555" },
  inputGroup: { marginBottom: "20px" },
  label: { fontWeight: "600", display: "block", marginBottom: "6px" },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  hint: { color: "#777" },
  actions: { display: "flex", gap: "10px", marginBottom: "25px" },
  primaryBtn: {
    padding: "12px 20px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "12px 20px",
    background: "#ddd",
    border: "none",
    borderRadius: "8px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
  },
  cardTitle: { marginBottom: "10px" },
  job: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
  bar: {
    height: "8px",
    background: "#eee",
    borderRadius: "10px",
    marginTop: "10px",
  },
  barFill: {
    height: "100%",
    background: "#000",
    borderRadius: "10px",
  },
};
