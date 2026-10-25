
import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/$/, "");

export default function App() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [action, setAction] = useState("summarize");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult("");

    if (!file && !text.trim()) {
      setError("Upload a PDF or paste some text first.");
      return;
    }

    if (file && text.trim()) {
      setError("Choose either a PDF or pasted text, not both.");
      return;
    }

    const formData = new FormData();
    formData.append("action", action);

    if (file) {
      formData.append("file", file);
    } else {
      formData.append("text", text);
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data.result || "No result was returned.");
    } catch (err) {
      setError(
        err.message ||
        "Could not connect to the server. Check the backend URL and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearInput() {
    setFile(null);
    setText("");
    setResult("");
    setError("");

    const input = document.getElementById("pdf-file");
    if (input) input.value = "";
  }

  return (
    <main className="page">
      <header className="header">
        <div className="logo">DA</div>
        <div>
          <p className="eyebrow">AI-POWERED TOOL</p>
          <h1>Document Analyzer</h1>
        </div>
      </header>

      <section className="intro">
        <p className="tag">Understand documents faster</p>
        <h2>Your documents, made simpler.</h2>
        <p>
          Upload a PDF or paste text. Get a summary, extract key information,
          or analyze the content with AI.
        </p>
      </section>

      <section className="panel">
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="pdf-file">
            Upload a PDF
          </label>
          <input
            id="pdf-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError("");
            }}
          />
          <p className="hint">PDF only · Maximum file size: 10 MB</p>

          <div className="separator"><span>OR PASTE TEXT</span></div>

          <label className="field-label" htmlFor="document-text">
            Document text
          </label>
          <textarea
            id="document-text"
            rows="7"
            maxLength={50000}
            placeholder="Paste the content you want to analyze..."
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
            }}
          />
          <p className="hint">{text.length.toLocaleString()} / 50,000 characters</p>

          <label className="field-label" htmlFor="action">
            What would you like to do?
          </label>
          <select
            id="action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <option value="summarize">Summarize document</option>
            <option value="extract">Extract key points</option>
            <option value="analyze">Analyze document</option>
          </select>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Working..." : "Analyze document"}
            </button>
            <button className="secondary" type="button" onClick={clearInput}>
              Clear
            </button>
          </div>
        </form>
      </section>

      {result && (
        <section className="result-panel" aria-live="polite">
          <div className="result-heading">
            <div>
              <p className="eyebrow">AI OUTPUT</p>
              <h2>
                {action === "summarize"
                  ? "Document Summary"
                  : action === "extract"
                    ? "Key Points"
                    : "Document Analysis"}
              </h2>
            </div>
            <button
              className="secondary"
              type="button"
              onClick={() => navigator.clipboard.writeText(result)}
            >
              Copy result
            </button>
          </div>
          <div className="result-text">{result}</div>
        </section>
      )}

      <footer>
        <p>AI Document Analyzer · Review AI-generated results before relying on them.</p>
      </footer>
    </main>
  );
}
