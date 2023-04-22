import { Typography } from "@mui/material";
import React, { useContext, useEffect } from "react";
import EnterAnswer from "../components/moleculars/EnterAnswer";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import LiveSocket from "../model/LiveSocket";
import { INTERCEPT, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";

function Home() {
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  useEffect(() => {
    socket.on(INTERCEPT.OPEN, (type, origin) => {
      console.log(type, origin);
      socket.sendNonBinary(SIGNAL.ROOM, "create", {}).then((result) => {
        console.log("result", result);
      });
    });
    socket.on(INTERCEPT.NON_BINARY_MESSAGE, (type, origin) => {
      console.log(type, origin);
    });

    socketDispatch({
      type: LIVE_SOCKET_ACTION.CONNECT,
      protocol: "ws",
      host: "localhost",
      port: 4000,
    });
    socketDispatch({
      type: LIVE_SOCKET_ACTION.INITIALIZE,
    });
    console.log(socket);
  }, []);

  return (
    <div>
      <EnterAnswer
        title={"/" + "path" + " 입장"}
        content={<Typography component='span'>테스트</Typography>}
        to='/test'
      />
    </div>
  );
}

export default Home;
