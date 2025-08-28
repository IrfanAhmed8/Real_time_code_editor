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


function Editor({socketRef, roomId, onCodeChange, outputVisible, output, readOnly}) {
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
      readOnly: readOnly ? "nocursor" : false,
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
}, [roomId,readOnly]);

useEffect(() => {
  if (socketRef.current) {
    const handleCodeChange = ({ code }) => {
      if (code !== null && code !== undefined) {
        if (code !== editorRef.current.getValue()) {
          editorRef.current.setValue(code);
          localStorage.setItem(`code_${roomId}`, code);
        }
      }
    };

    socketRef.current.on("code-change", handleCodeChange);

    return () => {
      socketRef.current.off("code-change", handleCodeChange);
    };
  }
}, [roomId]);


  return (
    <div>   
      <div className="editor-container">
        <textarea ref={textareaRef} id="realTimeEditor" />
      </div>
      {outputVisible && (
        <div style={{
          background: "#1e1e1e",
          color: "white",
          padding: "10px",
          borderTop: "2px solid #444",
          height: "200px",
          overflowY: "auto",
        }}>
          <pre style={{ whiteSpace: "pre-wrap" }}>Output:\n{output.trim()}</pre>
        </div>
      )}
    </div>
  );
}

export default Editor;
