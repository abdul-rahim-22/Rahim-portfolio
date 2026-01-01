import React, { useState, useEffect } from "react";

const API_URL =
  "https://corsproxy.io/?https://remoteok.com/api";

const SkillIncomeMatcher = () => {
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load saved result
  useEffect(() => {
    const saved = localStorage.getItem("realSkillMatcher");
    if (saved) setResult(JSON.parse(saved));
  }, []);

  // Save result
  useEffect(() => {
    if (result) {
      localStorage.setItem("realSkillMatcher", JSON.stringify(result));
    }
  }, [result]);

  const fetchJobs = async () => {
    if (!skill) return alert("Enter a skill");

    setLoading(true);

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // Remove metadata object
      const jobList = data.slice(1);

      // Match skill with tags
      const matchedJobs = jobList.filter(
        (job) =>
          job.tags &&
          job.tags.some((tag) =>
            tag.toLowerCase().includes(skill.toLowerCase())
          )
      );

      const output = {
        skill,
        totalJobs: matchedJobs.length,
        demand:
          matchedJobs.length > 50
            ? "🔥 High"
            : matchedJobs.length > 20
            ? "⚡ Medium"
            : "❄️ Low",
        companies: matchedJobs.slice(0, 5).map((j) => j.company),
      };

      setJobs(matchedJobs.slice(0, 5));
      setResult(output);
    } catch (err) {
      alert("API error");
    }

    setLoading(false);
  };

  return (
    <div style={styles.box}>
      <h2>🌍 REAL Skill Demand Checker</h2>

      <input
        style={styles.input}
        placeholder="Enter skill (e.g. react, python)"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      <button style={styles.button} onClick={fetchJobs}>
        {loading ? "Checking..." : "Check Real Demand"}
      </button>

      {result && (
        <div style={styles.result}>
          <p><b>Skill:</b> {result.skill}</p>
          <p><b>Remote Jobs Found:</b> {result.totalJobs}</p>
          <p><b>Demand Level:</b> {result.demand}</p>

          <p><b>Top Hiring Companies:</b></p>
          <ul>
            {result.companies.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {jobs.length > 0 && (
        <div>
          <h4>Sample Jobs</h4>
          {jobs.map((job) => (
            <div key={job.id} style={styles.job}>
              <a href={job.url} target="_blank">
                {job.position}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  box: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "sans-serif",
    background: "#f4f4f4",
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
  result: {
    background: "#fff",
    padding: "15px",
    marginTop: "15px",
  },
  job: {
    background: "#fff",
    padding: "8px",
    marginTop: "5px",
  },
};

export default SkillIncomeMatcher;
