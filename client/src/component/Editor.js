import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror"; // import main library
import { ACTIONS } from "../Action";
import axios from "axios";
// Import CSS first
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import { useState } from "react";
// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";


// Import modes
import "codemirror/mode/javascript/javascript";
import { X } from "lucide-react";


function Editor({socketRef, roomId, onCodeChange, outputVisible, output,setOutputVisible}) {
  const textareaRef = useRef(null);
  //editorref is used to detect change on the ediotr
  const editorRef = useRef(null);
  useEffect(() => {
  
  if (textareaRef.current) {
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: { name: "javascript", json: true },
      theme: "dracula",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
     
    });

    editor.setSize("100%", "100%");
    editorRef.current = editor;

    const savedCode = localStorage.getItem(`code_${roomId}`);
    if (savedCode) {
      editor.setValue(savedCode);
    }

    editor.on("change", (instance, changes) => {
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);
      localStorage.setItem(`code_${roomId}`, code);

      if (origin !== "setValue") {
        socketRef.current.emit("code-change", { roomId, code });
      }
    });
  }
}, [roomId]);

useEffect(() => {
  if (!socketRef.current || !editorRef.current) return;

  const handleCodeChange = ({ code }) => {
    if (code !== null && code !== undefined) {
      const editor = editorRef.current;
      if (editor && code !== editor.getValue()) {
        editor.setValue(code);
        localStorage.setItem(`code_${roomId}`, code);
      }
    }
  };

  socketRef.current.on("code-change", handleCodeChange);

  return () => {
    socketRef.current.off("code-change", handleCodeChange);
  };
}, [roomId, socketRef.current, editorRef.current]);



 return (
    <div
      className="editor-container d-flex flex-column flex-grow-1"
      style={{
        backgroundColor: "#0d1117",
        color: "#f0f6fc",
        fontFamily: "'Fira Code', monospace",
        overflow: "hidden",
      }}
    >
      {/* ===== Code Editor ===== */}
      <div
        className="flex-grow-1 position-relative"
        style={{
          background: "#1e1e1e",
          borderTop: "1px solid #2e2e2e",
          borderBottom: outputVisible ? "2px solid #2e2e2e" : "none",
          padding: "8px",
        }}
      >
        <textarea
          ref={textareaRef}
          id="realTimeEditor"
          spellCheck="false"
          className="w-100 h-100 border-0"
          style={{
            resize: "none",
            outline: "none",
            background: "transparent",
            color: "#f0f6fc",
            fontSize: "0.95rem",
            lineHeight: "1.5",
            fontFamily: "'Fira Code', monospace",
          }}
        />
      </div>

      {/* ===== Output Console ===== */}
      {outputVisible && (
        <div
          className="output-console position-relative"
          style={{
            background: "#161b22",
            color: "#c9d1d9",
            borderTop: "1px solid #2e2e2e",
            padding: "12px 16px 10px 16px",
            fontFamily: "'Fira Code', monospace",
            fontSize: "0.9rem",
            height: "200px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {/* Close Button */}
           <div
            className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
            style={{ borderColor: "#2e2e2e" }}
          >
            <span className="text-success fw-semibold">▶ Output</span>
            <button
              onClick={() => setOutputVisible(false)}
              className="btn btn-sm p-1"
              style={{
                background: "transparent",
                border: "none",
                color: "#8b949e",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#ff6b6b")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#8b949e")}
              aria-label="Close Output"
            >
              {typeof X === "function" ? <X size={16} /> : "×"}
            </button>
          </div>


          {/* Output Label */}
          

          {/* Output Text */}
          <pre
            style={{
              margin: 0,
              color: output.trim().includes("Error") ? "#ff5555" : "#f0f6fc",
            }}
          >
            {output.trim() || "No output yet..."}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Editor;