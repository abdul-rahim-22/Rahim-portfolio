import React, { useState } from "react";

const REMOTEOK = "https://corsproxy.io/?https://remoteok.com/api";

export default function ProfessionalSkillDashboard() {
  const [skill, setSkill] = useState("");
  const [jobs, setJobs] = useState([]);
  const [repos, setRepos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!skill) return alert("Enter a skill");
    setLoading(true);

    /* ---------------- JOBS ---------------- */
    try {
      const jobRes = await fetch(REMOTEOK);
      const jobData = await jobRes.json();
      const jobList = jobData.slice(1);

      const matchedJobs = jobList.filter((job) =>
        `${job.position} ${job.description} ${job.tags?.join(" ")}`
          .toLowerCase()
          .includes(skill.toLowerCase())
      );

      setJobs(matchedJobs.slice(0, 8));
    } catch {
      setJobs([]);
    }

    /* ---------------- GITHUB ---------------- */
    try {
      const gitRes = await fetch(
        `https://api.github.com/search/repositories?q=${skill}&sort=stars&order=desc`
      );
      const gitData = await gitRes.json();

      setRepos(
        (gitData.items || []).slice(0, 5).map((r) => ({
          name: r.full_name,
          url: r.html_url,
          stars: r.stargazers_count,
          description: r.description,
        }))
      );
    } catch {
      setRepos([]);
    }

    /* ---------------- REDDIT ---------------- */
    try {
      const redRes = await fetch(
        `https://corsproxy.io/?https://www.reddit.com/search.json?q=${skill}&limit=6`
      );
      const redData = await redRes.json();

      setPosts(
        redData.data.children.map((p) => ({
          title: p.data.title,
          url: "https://reddit.com" + p.data.permalink,
          subreddit: p.data.subreddit,
        }))
      );
    } catch {
      setPosts([]);
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Skill Market Research</h1>
      <p style={styles.subtitle}>
        Real hiring data, open-source activity, and community signals
      </p>

      <input
        style={styles.input}
        placeholder="Enter a skill (e.g. Social Media, React, Python)"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
      />

      <button style={styles.button} onClick={analyze}>
        {loading ? "Loading data…" : "Research Skill"}
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

      {/* GITHUB */}
      {repos.length > 0 && (
        <section style={styles.section}>
          <h2>Open-Source Activity</h2>
          {repos.map((repo, i) => (
            <div key={i} style={styles.item}>
              <a href={repo.url} target="_blank" rel="noreferrer">
                <strong>{repo.name}</strong>
              </a>
              <div>{repo.description}</div>
              <small>⭐ {repo.stars.toLocaleString()}</small>
            </div>
          ))}
        </section>
      )}

      {/* REDDIT */}
      {posts.length > 0 && (
        <section style={styles.section}>
          <h2>Recent Community Discussions</h2>
          {posts.map((p, i) => (
            <div key={i} style={styles.item}>
              <a href={p.url} target="_blank" rel="noreferrer">
                {p.title}
              </a>
              <small>r/{p.subreddit}</small>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "32px",
    fontFamily: "Inter, system-ui, sans-serif",
    textAlign: "left",
    background: "#ffffff",
  },
  title: { marginBottom: "4px" },
  subtitle: { color: "#555", marginBottom: "24px" },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "12px",
    fontSize: "15px",
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
  section: {
    marginBottom: "40px",
  },
  item: {
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
};
