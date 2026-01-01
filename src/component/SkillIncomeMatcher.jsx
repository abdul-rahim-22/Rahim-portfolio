import React, { useState, useEffect } from "react";

const WEAK_PHRASES = [
  "responsible for",
  "worked on",
  "helped with",
  "tasked with",
];

const REQUIRED_SECTIONS = [
  "summary",
  "skills",
  "experience",
];

export default function LiveCVAnalyzer() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    analyze(text);
  }, [text]);

  const analyze = (content) => {
    const problems = [];
    const lower = content.toLowerCase();

    // Missing sections
    REQUIRED_SECTIONS.forEach((sec) => {
      if (!lower.includes(sec)) {
        problems.push({
          type: "missing",
          message: `Missing "${sec}" section`,
        });
      }
    });

    // Weak phrases
    WEAK_PHRASES.forEach((phrase) => {
      if (lower.includes(phrase)) {
        problems.push({
          type: "weak",
          phrase,
          message: `Weak phrase detected: "${phrase}"`,
        });
      }
    });

    // No metrics
    if (!content.match(/\b\d+%|\b\d+\+|\$\d+|\b\d+ years/)) {
      problems.push({
        type: "metrics",
        message: "No measurable results found (%, $, years)",
      });
    }

    // Length checks
    if (content.length > 0 && content.length < 1200) {
      problems.push({
        type: "length",
        message: "CV is too short (ATS prefers detailed CV)",
      });
    }

    if (content.length > 6000) {
      problems.push({
        type: "length",
        message: "CV is too long (keep it 1–2 pages)",
      });
    }

    setIssues(problems);
  };

  const highlightText = () => {
    let highlighted = text;

    WEAK_PHRASES.forEach((phrase) => {
      const regex = new RegExp(phrase, "gi");
      highlighted = highlighted.replace(
        regex,
        `<span class="issue">$&</span>`
      );
    });

    return highlighted.replace(/\n/g, "<br />");
  };

  return (
    <div style={styles.page}>
      <h1>Live CV Analyzer</h1>
      <p style={styles.sub}>
        Paste your resume — issues will be highlighted in real time
      </p>

      <div style={styles.editorWrapper}>
        <div
          style={styles.editor}
          contentEditable
          onInput={(e) => setText(e.currentTarget.innerText)}
          dangerouslySetInnerHTML={{ __html: highlightText() }}
        />

        <div style={styles.panel}>
          <h3>Issues Found</h3>

          {issues.length === 0 && (
            <p style={{ color: "green" }}>
              ✅ No critical issues detected
            </p>
          )}

          <ul>
            {issues.map((i, idx) => (
              <li key={idx}>{i.message}</li>
            ))}
          </ul>

          <h4>How to Fix</h4>
          <ul>
            <li>Use action verbs (Led, Built, Improved)</li>
            <li>Add numbers (% growth, users, revenue)</li>
            <li>Include Summary, Skills, Experience</li>
            <li>Avoid weak phrases</li>
          </ul>
        </div>
      </div>

      <style>{`
        .issue {
          text-decoration: underline;
          text-decoration-color: red;
          text-decoration-thickness: 2px;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "40px auto",
    fontFamily: "Inter, system-ui, sans-serif",
    textAlign: "left",
  },
  sub: { color: "#555", marginBottom: "20px" },
  editorWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    gap: "20px",
  },
  editor: {
    minHeight: "500px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
    whiteSpace: "pre-wrap",
  },
  panel: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "16px",
    background: "#fafafa",
  },
};
