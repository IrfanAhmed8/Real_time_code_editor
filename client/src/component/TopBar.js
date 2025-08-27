import React from 'react'

function topBar({ language, setLanguage, runCode,pushButton }) {

  return (
    <div>
        <div className="d-flex justify-content-end align-items-center" style={{ background: "#1e1e1e"}}>
        <span style={{marginRight:"700px"}}>CODE-MATE</span>
            <select value={language} 
            onChange={(e) => setLanguage(e.target.value)}

             className="form-select w-auto me-2"
              style={{ background: "#1e1e1e", color: "white", border: "1px solid #555" }}
              >
                <option value="python">Python</option>
                <option value="javascript">Javascript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <button onClick={runCode} className="btn btn-success">
               Run ▶ 
              </button>
              {pushButton && (
        <button className="btn btn-warning">
          Push ⬆
        </button>
      )}
          </div>
    </div>
  )
}

export default topBar