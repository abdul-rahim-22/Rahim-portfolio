import React, { useState, useEffect } from "react";

const API =
  "https://corsproxy.io/?https://remoteok.com/api";

export default function SkillDemandChecker() {
  const [skill, setSkill] = useState("");
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // load saved data
  useEffect(() => {
    const saved = localStorage.getItem("skillDemandReal");
    if (saved) {
      const parsed = JSON.parse(saved);
      setResult(parsed.result);
      setJobs(parsed.jobs);
    }
  }, []);

  // save data
  useEffect(() => {
    if (result) {
      localStorage.setItem(
        "skillDemandReal",
        JSON.stringify({ result, jobs })
      );
    }
  }, [result, jobs]);

  const checkDemand = async () => {
    if (!skill) return alert("Enter any skill");

    setLoading(true);

    try {
      const res = await fetch(API);
      const data = await res.json();

      // remove first metadata object
      const jobList = data.slice(1);

      const matched = jobList.filter((job) => {
        const text =
          `${job.position} ${job.description} ${job.tags?.join(" ")}`.toLowerCase();
        return text.includes(skill.toLowerCase());
      });

      // sort by date (latest first)
      matched.sort(
        (a, b) => (b.date || 0) - (a.date || 0)
      );

      const output = {
        skill,
        totalJobs: matched.length,
        demand:
          matched.length > 60
            ? "🔥 Very High"
            : matched.length > 25
            ? "⚡ Medium"
            : "❄️ Low",
        checkedAt: new Date().toLocaleString(),
      };

      setResult(output);
      setJobs(matched.slice(0, 7)); // latest 7 jobs
    } catch (e) {
      alert("Failed to fetch jobs");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>🌍 Real Skill Demand Checker</h2>

      <input
        style={styles.input}
        placeholder="Enter ANY skill (React, Excel, AI, QA...)"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      <button onClick={checkDemand} style={styles.button}>
        {loading ? "Checking..." : "Check Real Jobs"}
      </button>

      {result && (
        <div style={styles.card}>
          <p><b>Skill:</b> {result.skill}</p>
          <p><b>Total Remote Jobs:</b> {result.totalJobs}</p>
          <p><b>Demand Level:</b> {result.demand}</p>
          <p><b>Last Checked:</b> {result.checkedAt}</p>
        </div>
      )}

      {jobs.length > 0 && (
        <div>
          <h3>🆕 Latest Jobs</h3>
          {jobs.map((job) => (
            <div key={job.id} style={styles.job}>
              <a href={job.url} target="_blank" rel="noreferrer">
                <b>{job.position}</b>
              </a>
              <p>{job.company}</p>
              <small>Tags: {job.tags?.join(", ")}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "520px",
    margin: "40px auto",
    padding: "20px",
    background: "#f5f5f5",
    fontFamily: "sans-serif",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#000",
    color: "#fff",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    padding: "15px",
    marginTop: "15px",
  },
  job: {
    background: "#fff",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
  },
};
