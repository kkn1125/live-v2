import { Typography } from "@mui/material";
import React, { useContext, useEffect } from "react";
import { v4 } from "uuid";
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
      // console.log(type, origin);
      socket.sendBinary(SIGNAL.ROOM, "create", {
        id: v4(),
      });
      socket.on(SIGNAL.ROOM, (type, message, data) => {
        console.log(type, message, data);
      });
    });
    socket.on(INTERCEPT.NON_BINARY_MESSAGE, (type, origin, data) => {
      console.log(type, origin, data);
    });

    socketDispatch({
      type: LIVE_SOCKET_ACTION.CONNECT,
      queries: {
        roomId: v4(),
        userId: v4(),
      },
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
