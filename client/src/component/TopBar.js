import React from "react";

function TopBar({ language, setLanguage, runCode }) {
  const selectStyle = {
  backgroundColor: "#020617",
  color: "#e5e7eb",
  border: "1px solid #1f2937",
  borderRadius: "8px",
  padding: "6px 12px",
  fontSize: "0.85rem",
  cursor: "pointer",
};
const runButtonStyle = {
  backgroundColor: "#22c55e",
  color: "#052e16",
  border: "none",
  borderRadius: "8px",
  padding: "6px 16px",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(34,197,94,0.25)",
  transition: "all 0.2s ease",
};

  return (
  <header
    className="d-flex justify-content-between align-items-center px-4"
    style={{
      height: "56px",
      background: "rgba(15, 23, 42, 0.85)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid #1f2937",
    }}
  >
    {/* Left: Brand */}
    <div className="d-flex align-items-center gap-2">
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "8px",
          background: "rgba(34,197,94,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src="/images/logo.png" alt="Logo" style={{ width: "20px" }} />
      </div>

      <span
        style={{
          fontWeight: 600,
          letterSpacing: "0.5px",
          color: "#e5e7eb",
        }}
      >
        CODE<span style={{ color: "#22c55e" }}>MATE</span>
      </span>
    </div>

    {/* Right: Controls */}
    <div className="d-flex align-items-center gap-3">
      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={selectStyle}
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      {/* Run Button */}
      <button
        onClick={runCode}
        style={runButtonStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-1px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0)")
        }
      >
        ▶ Run
      </button>
    </div>
  </header>
);

}

export default TopBar;
