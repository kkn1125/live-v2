import { Box, Chip, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import EnterAnswer from "../components/moleculars/EnterAnswer";
import Chat from "../components/organisms/Chat";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import LiveSocket from "../model/LiveSocket";
import { INTERCEPT, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);

  useEffect(() => {
    socket.ifActivated(() => {
      socket.on(SIGNAL.ROOM, (type, origin, data) => {
        console.log(data);
        if (data.action === "create") {
          const roomsData = data.result.rooms;
          setRooms((rooms) => roomsData);
        } else if (data.action === "update") {
          const roomsData = data.result.rooms;
          setRooms((rooms) => roomsData);
        } else if (data.action === "fetch") {
          const roomsData = data.result.rooms;
          setRooms((rooms) => roomsData);
        }
      });
      socket.on(SIGNAL.USER, (type, origin, data) => {
        if (data.action === "update") {
          const roomsData = data.result.rooms;
          setRooms((rooms) => roomsData);
        }
      });
      socket.sendBinary(SIGNAL.ROOM, "fetch");
    });

    return () => {
      // socketDispatch({
      //   type: LIVE_SOCKET_ACTION.OUT,
      //   roomId:
      // });
      socket.off(SIGNAL.ROOM);
    };
  }, []);

  return (
    <div>
      <Stack>
        {rooms.map(
          (room, i) =>
            room.admin && (
              <Stack key={i} direction='row' gap={1} alignItems='center'>
                <Typography component='span'>{i + 1}.</Typography>
                <Typography component='span'>{room.title}</Typography>
                <Chip
                  icon={<SupervisorAccountIcon />}
                  label={room.admin.nickname}
                />
                <EnterAnswer
                  type='enter'
                  title={room.title + "입장"}
                  content={<Typography component='span'>room</Typography>}
                  to='/live'
                  roomId={room.id}
                  roomTitle={room.title}
                  color='success'
                  variant='contained'
                />
              </Stack>
            )
        )}
      </Stack>
      <EnterAnswer
        type='create'
        title={"룸 생성"}
        content={<Typography component='span'>room</Typography>}
        to='/live'
      />
      <Chat />
    </div>
  );
}

export default Home;
