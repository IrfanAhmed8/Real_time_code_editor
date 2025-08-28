import React from 'react'

function topBar({ language, setLanguage, runCode,pushButton }) {

 return (
  <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom"
       style={{ background: "#1e1e1e" }}>

    {/* Title */}
    <span className="fw-bold fs-4 text-info">CODE-MATE</span>

    {/* Controls */}
    <div className="d-flex align-items-center gap-2">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="form-select form-select-sm"
        style={{ background: "#2c2c2c", color: "white", border: "1px solid #555" }}
      >
        <option value="python">Python</option>
        <option value="javascript">Javascript</option>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
      </select>

      <button onClick={runCode} className="btn btn-success btn-sm">
        Run ▶
      </button>
    </div>
  </div>
);

}

export default topBar