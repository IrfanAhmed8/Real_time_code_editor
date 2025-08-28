import Home from "./component/Home";
import {Routes,Route} from "react-router-dom";
import EditorPage  from "./component/EditorPage";
import EditorWithAdmin from "./component/EditorWithAdmin";
import Push_request from "./component/Push_request";

import {Toaster} from "react-hot-toast";
function App() {
  return (
    <>
    <Toaster position="top-center"></Toaster>
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/EditorPage/:roomId" element={<EditorPage   />} />
    <Route path="/EditorWithAdmin/:roomId" element={<EditorWithAdmin  />}/>
    <Route path="/EditorWthAdmin/push_request/:roomId" element={<Push_request />} />
   </Routes>
   </>
   
  );
}

export default App;

