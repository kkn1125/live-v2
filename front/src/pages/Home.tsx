import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import EnterAnswer from "../components/moleculars/EnterAnswer";
import Chat from "../components/organisms/Chat";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import LiveSocket from "../model/LiveSocket";
import {
  DataLiveSocketEventListenerType,
  INTERCEPT,
  LIVE_SOCKET_ACTION,
  SIGNAL,
} from "../util/global";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);

  const roomHandler: DataLiveSocketEventListenerType = (type, origin, data) => {
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
    } else if (data.action === "delete") {
      const roomsData = data.result.rooms;
      setRooms((rooms) => roomsData);
    }
  };

  const userHandler: DataLiveSocketEventListenerType = (type, origin, data) => {
    if (data.action === "update") {
      const roomsData = data.result.rooms;
      setRooms((rooms) => roomsData);
    }
  };

  useEffect(() => {
    socket.ifActivated(() => {
      socket.on(SIGNAL.ROOM, roomHandler);
      socket.on(SIGNAL.USER, userHandler);

      socket.sendBinary(SIGNAL.ROOM, "fetch");
    });

    return () => {
      socket.removeListener(SIGNAL.ROOM, roomHandler);
      socket.removeListener(SIGNAL.USER, userHandler);
    };
  }, []);

  return (
    <div>
      <Stack>
        {rooms.map((room, i) => (
          <Stack
            component={Paper}
            elevation={5}
            key={i}
            direction='row'
            gap={1}
            alignItems='center'
            sx={{
              p: 3,
            }}>
            <EnterAnswer
              type='enter'
              title={room.title + "입장"}
              content={<Typography component='span'>room</Typography>}
              to='/live'
              roomId={room.id}
              roomTitle={room.title}
              color='success'
              variant='contained'>
              <Stack>
                <Box>
                  <Chip
                    icon={<SupervisorAccountIcon />}
                    label={room.admin.nickname}
                  />
                </Box>
                <Stack direction='row'>
                  <Typography component='span'>{room.title}</Typography>
                </Stack>
              </Stack>
            </EnterAnswer>
          </Stack>
        ))}
      </Stack>
      {/* <EnterAnswer
        type='create'
        title={"룸 생성"}
        content={<Typography component='span'>room</Typography>}
        to='/live'
      /> */}
      {/* <Chat /> */}
    </div>
  );
}

export default Home;
