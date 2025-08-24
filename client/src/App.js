import Home from "./component/Home";
import {Routes,Route} from "react-router-dom";
import Editor  from "./component/Editor";
import EditorWithAdmin from "./component/EditorWithAdmin";
import {Toaster} from "react-hot-toast";
function App() {
  return (
    <>
    <Toaster position="top-center"></Toaster>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/Editor/:roomId" element={<Editor />} />
    <Route path="/Editor/:roomId/:userType" element={<EditorWithAdmin />}/>
   </Routes>
   </>
   
  );
}

export default App;

