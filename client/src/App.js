import Home from "./component/Home";
import {Routes,Route} from "react-router-dom";
import EditorPage  from "./component/EditorPage";
import EditorWithAdmin from "./component/EditorWithAdmin";
import {Toaster} from "react-hot-toast";
function App() {
  return (
    <>
    <Toaster position="top-center"></Toaster>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/Editor/:roomId" element={<EditorPage editorCount={1} pushButton={false} />} />
    <Route path="/EditorWithAdmin/:roomId" element={<EditorPage editorCount={2} pushButton={true} />}/>
   </Routes>
   </>
   
  );
}

export default App;

