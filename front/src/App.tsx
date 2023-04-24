import { useContext, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/templates/Layout";
import LiveLayout from "./components/templates/LiveLayout";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "./context/LiveSocketProvider";
import Home from "./pages/Home";
import LiveRoom from "./pages/LiveRoom";
import NotFound from "./pages/NotFound";
import ViewLiveRoom from "./pages/ViewLiveRoom";
import { LIVE_SOCKET_ACTION } from "./util/global";

function App() {
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);

  useEffect(() => {
    socketDispatch({
      type: LIVE_SOCKET_ACTION.CONNECT,
    });
    socketDispatch({
      type: LIVE_SOCKET_ACTION.INITIALIZE,
    });
  }, []);
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
