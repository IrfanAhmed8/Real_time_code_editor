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

function Editor({socketRef,roomId,onCodeChange}) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      const editor = CodeMirror.fromTextArea(textareaRef.current, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editor.setSize(null, "100%");
      editorRef.current = editor;

      editor.on("change", (instance, changes) => {
        console.log("change", instance.getValue(), changes);
        const {origin} =changes;
        const code=instance.getValue();
        onCodeChange(code)
        if(origin !=='setValue'){
          socketRef.current.emit("code-change",{
            roomId,
            code,
          })
        }
      });
     
    }
  
  }, []);
  useEffect(()=>{
     if(socketRef.current){
      socketRef.current.on('code-change',({code})=>{
        if(code!==null){
          editorRef.current.setValue(code);
        }
      })
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
    
  },[socketRef.current])

const runCode = async () => {
  console.log("Run button clicked");  // 👈 check if button works
  const code = editorRef.current.getValue();
  console.log("Sending code:", code); // 👈 check if code is being captured

  try {
    const res = await axios.post("http://localhost:5000/run", {
      language: "python",
      code,
    });
    console.log("Response from backend:", res.data); // 👈 debug response
    setOutput(res.data.output);
    console.log("Updated output:", res.data.output);
  } catch (err) {
    console.error("Error calling backend:", err);
    setOutput("Error running code");
  }
};

  
  return (
    <div style={{ height: "600px" }}>
      <textarea ref={textareaRef} id="realTimeEditor" />
      <br />
      <button onClick={runCode}>Run</button>
      <pre>{output}</pre>
    </div>
  );
}

export default Editor;
