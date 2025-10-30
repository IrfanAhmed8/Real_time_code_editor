import React from "react";

function TopBar({ language, setLanguage, runCode }) {
  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom shadow-sm"
      style={{
        background: "linear-gradient(90deg, #1a1a1a 0%, #1f1f1f 100%)",
        borderBottom: "1px solid #2e2e2e",
      }}
    >
      {/* Logo / Title */}
      <div className="d-flex align-items-center gap-2">
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{ width: "28px", height: "28px", filter: "drop-shadow(0 0 4px #00ff88aa)" }}
        />
        <span
          className="fw-bold fs-5 text-light"
          style={{
            letterSpacing: "1px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          CODE<span style={{ color: "#00ff88" }}>MATE</span>
        </span>
      </div>

      {/* Controls */}
      <div className="d-flex align-items-center gap-3">
        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="form-select form-select-sm"
          style={{
            backgroundColor: "#252526",
            color: "#f0f0f0",
            border: "1px solid #3a3a3a",
            borderRadius: "6px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#00ff88")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        {/* Run Button */}
        <button
          onClick={runCode}
          className="btn btn-sm fw-semibold"
          style={{
            background: "linear-gradient(90deg, #00ff88, #00b86b)",
            border: "none",
            color: "#0b0f13",
            borderRadius: "8px",
            padding: "6px 18px",
            boxShadow: "0 0 8px #00ff8855",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 0 10px #00ff8899";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 0 8px #00ff8855";
          }}
        >
          ▶ Run
        </button>
      </div>
    </header>
  );
}

export default TopBar;
