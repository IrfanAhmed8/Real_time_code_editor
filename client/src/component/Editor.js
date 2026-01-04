import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror"; // import main library
import { ACTIONS } from "../Action";
import axios from "axios";
// Import CSS first
import "codemirror/lib/codemirror.css";
import { useState } from "react";
// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "./Editor.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "./EditorTheme.css";
import "codemirror/addon/selection/active-line";


// Import modes
import "codemirror/mode/javascript/javascript";
import { X } from "lucide-react";


function Editor({socketRef, roomId, onCodeChange, outputVisible, output,setOutputVisible}) {
  const textareaRef = useRef(null);
  let typingTimer = null;
  //editorref is used to detect change on the ediotr
  const editorRef = useRef(null);
  useEffect(() => {
  
  if (textareaRef.current) {
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: { name: "javascript", json: true },
      theme: "codemate",
      styleActiveLine: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      extraKeys: { "Ctrl-Space": "autocomplete" },
     
    });

    editor.setSize("100%", "100%");
    editorRef.current = editor;

    const savedCode = localStorage.getItem(`code_${roomId}`);
    if (savedCode) {
      editor.setValue(savedCode);
    }
    

editor.on("keyup", (cm, event) => {
  const triggerKeys = [" ", ".", "Enter"];
  console.log("Key pressed:", event.key);
  if (!triggerKeys.includes(event.key)) return;

  clearTimeout(typingTimer);

  typingTimer = setTimeout(async () => {
    const code = cm.getValue();
    console.log("Fetching Gemini suggestion for code:", code);
    const text = await fetchGeminiSuggestion(code);
    console.log("Gemini suggestion received:", text);
    showGeminiSuggestion(cm, text);
  }, 500);
});


    editor.on("change", (instance, changes) => {
      console.log("Editor content changed");
      const { origin } = changes;
      const code = instance.getValue();
      onCodeChange(code);
      localStorage.setItem(`code_${roomId}`, code);
      console.log("Origin of change:", code);
      if (origin !== "setValue") {
      socketRef.current.emit("code-change", { roomId, code });
      }
    });
  }
}, [roomId]);
const fetchGeminiSuggestion = async (code) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}api/gemini/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    return data.suggestion;
  } catch (err) {
    console.error("Gemini fetch error:", err);
    return "";
  }
};

const showGeminiSuggestion = (cm,text) => {
   if (!text || !text.trim()) return;
  CodeMirror.showHint(cm, () => {
    return {
      from: cm.getCursor(),
      to: cm.getCursor(),
      list: [text
      ],
    };
  }, { completeSingle: false });
};


useEffect(() => {
  if (!socketRef.current || !editorRef.current) return;

  const handleCodeChange = ({ code }) => {
    console.log("Received code change:", code);
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
    background: "#020617",
    borderBottom: outputVisible ? "1px solid #1f2937" : "none",
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
    style={{
      height: "200px",
      background: "#020617",
      borderTop: "1px solid #1f2937",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Header */}
    <div
      style={{
        height: "34px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        borderBottom: "1px solid #1f2937",
        fontSize: "0.75rem",
        color: "#22c55e",
      }}
    >
      ▶ Output
      <button
        onClick={() => setOutputVisible(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
        }}
      >
        <X size={14} />
      </button>
    </div>

    {/* Body */}
    <pre
      style={{
        flexGrow: 1,
        margin: 0,
        padding: "12px",
        fontSize: "0.85rem",
        color: output.includes("Error") ? "#ef4444" : "#e5e7eb",
        overflowY: "auto",
      }}
    >
      {output || "No output yet…"}
    </pre>
  </div>
)}

    </div>
  );
}

export default Editor;