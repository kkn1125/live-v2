import { Route, Routes } from "react-router-dom";
import Layout from "./components/templates/Layout";
import LiveLayout from "./components/templates/LiveLayout";
import Home from "./pages/Home";
import LiveRoom from "./pages/LiveRoom";
import NotFound from "./pages/NotFound";
import ViewLiveRoom from "./pages/ViewLiveRoom";

function App() {
  return (
    <Routes>
      <Route path='/live' element={<LiveLayout />}>
        <Route path='' element={<LiveRoom />} />
        <Route path=':roomId' element={<ViewLiveRoom />} />
      </Route>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />} />
        <Route path='*' element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
