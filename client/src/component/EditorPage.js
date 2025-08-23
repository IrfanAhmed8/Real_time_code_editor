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
  const [outputVisible, setOutputVisible] = useState(false);
  const [language, setLanguage] = useState("python");
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
  console.log("Run button clicked");  
  const code = editorRef.current.getValue();
  console.log("Sending code:", code);
  try {
    const res = await axios.post("http://localhost:5000/run", {
      language:language,
      code,
    });
    console.log("Response from backend:", res.data); //
    setOutput(res.data.output);
    console.log("Updated output:", res.data.output);
  } catch (err) {
    console.error("Error calling backend:", err);
    setOutput("Error running code");
  }
  setOutputVisible(!outputVisible);
};

  
  return (
    <div>
       <div className="d-flex justify-content-end align-items-center" style={{ background: "#1e1e1e"}}>
        <span style={{marginRight:"750px"}}>CODE-MATE</span>
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
          </div>
    <div className="editor-container">
      <textarea ref={textareaRef} id="realTimeEditor" />
      <br />
    </div>
    {outputVisible && (
            <div
              style={{
                background: "#1e1e1e",
                color: "white",
                padding: "10px",
                borderTop: "2px solid #444",
                height: "200px",
                overflowY: "auto",
              }}
            >
              <pre style={{ whiteSpace: "pre-wrap" }}>"Output /n{output.trim()}"</pre>
            </div>
          )}
    </div>
             
  );
}

export default Editor;
