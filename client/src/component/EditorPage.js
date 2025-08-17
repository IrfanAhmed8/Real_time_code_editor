import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror"; // import main library

// Import CSS first
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";

// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

// Import modes
import "codemirror/mode/javascript/javascript";

function Editor() {
  const textareaRef = useRef(null);

  useEffect(() => {
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: { name: "javascript", json: true },
      theme: "dracula",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });

    editor.setSize(null, "100%");
  }, []);

  return (
    <div style={{ height: "600px" }}>
      <textarea ref={textareaRef} id="realTimeEditor" />
    </div>
  );
}

export default Editor;
