import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import EnterAnswer from "../components/moleculars/EnterAnswer";
import Chat from "../components/organisms/[x]Chat";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import LiveSocket from "../model/LiveSocket";
import {
  CODEC,
  DataLiveSocketEventListenerType,
  INTERCEPT,
  LIVE_SOCKET_ACTION,
  SIGNAL,
} from "../util/global";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Hls from "hls.js";
import VideoJS from "../components/moleculars/VideoJS";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import PopupSlide from "../components/moleculars/PopupSlide";

const hls = new Hls({});

function Home() {
  const [rooms, setRooms] = useState<any[]>([]);
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const playerRef = useRef<HTMLVideoElement>();

  const roomHandler: DataLiveSocketEventListenerType = (type, origin, data) => {
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
    console.log("MediaRecorder", CODEC, MediaRecorder.isTypeSupported(CODEC));
    console.log(
      "MediaSource",
      "video/webm;codecs=vp9,opus",
      MediaSource.isTypeSupported("video/webm;codecs=vp9,opus")
    );
    if (Hls.isSupported()) {
      console.log("hello hls.js!");
      // hls.loadSource(``);
      // if (playerRef.current) {
      //   if (playerRef.current.canPlayType("application/x-mpegurl")) {
      //     console.log("supported!");

      //     playerRef.current.src =
      //       "http://localhost:3000/src/assets/videos/0.m3u8";
      //   } else {
      //     console.log("not supported!");
      //     if (Hls.isSupported()) {
      //       console.log("hls supported!");

      //       hls.loadSource("http://localhost:3000/src/assets/videos/0.m3u8");
      //       hls.attachMedia(playerRef.current);
      //     }
      //   }
      // }
    }

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

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: "/tuto/videos/sample720.m3u8",
        type: "application/x-mpegurl",
      },
    ],
    liveui: true,
  };

  const handlePlayerReady = (player: Player) => {
    (playerRef.current as any) = player;

    player.src("/tuto/videos/sample720.m3u8");

    // You can handle player events here, for example:
    // @ts-ignore
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    // @ts-ignore
    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <Stack sx={{ height: "100%" }}>
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
            <Stack direction='row' alignItems={"center"} gap={1}>
              <Stack sx={{ flex: 1 }}>
                <Typography component='span'>{room.title}</Typography>
                <Typography component='span'>
                  {new Date(room.createdAt).toLocaleString("ko")}
                </Typography>
              </Stack>
              <Box>
                <Chip
                  icon={<SupervisorAccountIcon />}
                  label={room.admin.nickname}
                />
              </Box>
            </Stack>
          </EnterAnswer>
        </Stack>
      ))}
      {/* <PopupSlide
        links={[
          { link: "test1", desc: "wow1" },
          { link: "test2", desc: "wow2" },
          { link: "test3", desc: "wow3" },
        ]}
      /> */}
      <Box
        sx={{
          height: "100%",
        }}>
        {/* <Box
          component='video'
          ref={playerRef}
          autoPlay
          playsInline
          controls
          preload='auto'
          data-set='{}'
          poster='https://www.tutorialspoint.com/videos/sample.png'
        > */}
        {/* <source
            src='http://localhost:3000/src/assets/videos/0.mp4'
            type='application/x-mpegurl'
          /> */}
        {/* </Box> */}
        {/* <VideoJS
          options={videoJsOptions}
          onReady={handlePlayerReady}
        /> */}
      </Box>
    </Stack>
  );
}

export default Home;
