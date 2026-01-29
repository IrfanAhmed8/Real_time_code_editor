import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror"; // import main library

// Import CSS first
import "codemirror/lib/codemirror.css";

// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "./Editor.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/show-hint.css";
import "./EditorTheme.css";
import "codemirror/addon/selection/active-line";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import { CodemirrorBinding } from "y-codemirror";

// Import modes
import "codemirror/mode/javascript/javascript";
import { X } from "lucide-react";


function Editor({socketRef, roomId, onCodeChange, outputVisible, output,setOutputVisible}) {
  const textareaRef = useRef(null);
  //editorref is used to detect change on the ediotr
  const editorRef = useRef(null);
 useEffect(() => {
  if (!textareaRef.current) return;

  const editor = CodeMirror.fromTextArea(textareaRef.current, {
    mode: { name: "javascript", json: true },
    theme: "codemate",
    styleActiveLine: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
  });
//set the editor value in onCOdeChange
  
  editor.setSize("100%", "100%");
  editorRef.current = editor;

  // ---- YJS SETUP ----
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider(
     process.env.REACT_APP_YJS_WEBSOCKET_ENDPOINT,
    roomId,
    ydoc
  );
provider.on("status", event => {
  console.log("Yjs status:", event.status); // "connected" | "disconnected"
});

  const yText = ydoc.getText("codemirror");

  const binding = new CodemirrorBinding(
    yText,
    editor,
    provider.awareness
  );
  const updateCodeFromYjs = () => {
  onCodeChange(yText.toString());
};

onCodeChange(yText.toString());
yText.observe(updateCodeFromYjs);

  // Optional awareness (recommended)
  provider.awareness.setLocalStateField("user", {
    name: "Anonymous", // replace with username
     color: getRandomColor(),
  });

  // ---- AI KEYUP LOGIC (SAFE) ----
  let typingTimer;

  editor.on("keyup", (cm, event) => {
    const triggerKeys = [" ", ".", "Enter"];
    if (!triggerKeys.includes(event.key)) return;

    clearTimeout(typingTimer);

    typingTimer = setTimeout(async () => {
      const code = cm.getValue();
      const text = await fetchGeminiSuggestion(code);
      showGeminiSuggestion(cm, text);
    }, 500);
  });

  // ---- CLEANUP ----
  return () => {
    yText.unobserve(updateCodeFromYjs);
    binding.destroy();
    provider.destroy();
    ydoc.destroy();
    editor.toTextArea();
  };
}, [roomId],[onCodeChange]);
function getRandomColor() {
  const colors = [
    "#e63946", "#f4a261", "#2a9d8f",
    "#457b9d", "#9b5de5", "#06d6a0"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const fetchGeminiSuggestion = async (code) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/gemini/suggest`, {
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