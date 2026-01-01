import React, { useState, useEffect } from "react";

const REMOTEOK =
  "https://corsproxy.io/?https://remoteok.com/api";

export default function UltimateSkillAnalyzer() {
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState([]);
  const [github, setGithub] = useState(null);
  const [reddit, setReddit] = useState(null);
  const [loading, setLoading] = useState(false);

  // load saved
  useEffect(() => {
    const saved = localStorage.getItem("ultimateSkillData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setJobs(parsed.jobs);
      setGithub(parsed.github);
      setReddit(parsed.reddit);
      setSkill(parsed.skill);
    }
  }, []);

  // save
  useEffect(() => {
    if (skill) {
      localStorage.setItem(
        "ultimateSkillData",
        JSON.stringify({ skill, jobs, github, reddit })
      );
    }
  }, [skill, jobs, github, reddit]);

  const analyze = async () => {
    if (!skill) return alert("Enter any skill");
    setLoading(true);

    try {
      /* -------- Remote Jobs -------- */
      const jobRes = await fetch(REMOTEOK);
      const jobData = await jobRes.json();
      const jobList = jobData.slice(1);

      const matchedJobs = jobList.filter((job) => {
        const text =
          `${job.position} ${job.description} ${job.tags?.join(" ")}`.toLowerCase();
        return text.includes(skill.toLowerCase());
      });

      matchedJobs.sort((a, b) => (b.date || 0) - (a.date || 0));
      setJobs(matchedJobs.slice(0, 7));

      /* -------- GitHub -------- */
      const gitRes = await fetch(
        `https://api.github.com/search/repositories?q=${skill}&sort=stars&order=desc`
      );
      const gitData = await gitRes.json();
      setGithub({
        totalRepos: gitData.total_count,
        topRepo: gitData.items?.[0]?.full_name,
        stars: gitData.items?.[0]?.stargazers_count,
      });

      /* -------- Reddit -------- */
      const redRes = await fetch(
        `https://www.reddit.com/search.json?q=${skill}+jobs&limit=10`
      );
      const redData = await redRes.json();
      setReddit({
        posts: redData.data.children.length,
      });
    } catch (e) {
      alert("API error");
    }

    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <h1>Skill Market Intelligence</h1>
      <p style={styles.sub}>
        Real-time career insights using free global data sources
      </p>

      <input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Enter any skill (React, Python, Excel, AI...)"
        style={styles.input}
      />

      <button onClick={analyze} style={styles.btn}>
        {loading ? "Analyzing..." : "Analyze Skill"}
      </button>

      {/* JOBS */}
      {jobs.length > 0 && (
        <section style={styles.card}>
          <h3>Latest Remote Jobs</h3>
          {jobs.map((job) => (
            <div key={job.id} style={styles.job}>
              <a href={job.url} target="_blank" rel="noreferrer">
                <b>{job.position}</b>
              </a>
              <p>{job.company}</p>
              <small>{job.tags?.join(", ")}</small>
            </div>
          ))}
        </section>
      )}

      {/* GITHUB */}
      {github && (
        <section style={styles.card}>
          <h3>GitHub Popularity</h3>
          <p><b>Total Repositories:</b> {github.totalRepos}</p>
          <p><b>Top Repo:</b> {github.topRepo}</p>
          <p><b>Stars:</b> ⭐ {github.stars}</p>
        </section>
      )}

      {/* REDDIT */}
      {reddit && (
        <section style={styles.card}>
          <h3>Community Buzz (Reddit)</h3>
          <p>
            <b>Recent Job Discussions:</b> {reddit.posts}
          </p>
        </section>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "760px",
    margin: "40px auto",
    padding: "30px",
    fontFamily: "Inter, sans-serif",
    textAlign: "left",
    background: "#f8f9fb",
    borderRadius: "12px",
  },
  sub: { color: "#555", marginBottom: "20px" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    padding: "12px 20px",
    background: "#000",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "25px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
  },
  job: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
};
