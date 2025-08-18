import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror"; // import main library
import { ACTIONS } from "../Action";
// Import CSS first
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";

// Import addons
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

// Import modes
import "codemirror/mode/javascript/javascript";

function Editor({socketRef,roomId,onCodeChange}) {
  const textareaRef = useRef(null);
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
  return (
    <div style={{ height: "600px" }}>
      <textarea ref={textareaRef} id="realTimeEditor" />
    </div>
  );
}

export default Editor;
