import { Box, Stack, Typography } from "@mui/material";
import React, {
  LegacyRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import VideoJS from "../components/moleculars/VideoJS";
import videojs from "video.js";
import { CODEC, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";
import Player from "video.js/dist/types/player";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import { v4 } from "uuid";
import { useLocation, useNavigate } from "react-router-dom";

let mediaSource = new MediaSource();
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;

let recordLoop: NodeJS.Timer;
let chunkStreamLoop: NodeJS.Timer;

function RecordRoom() {
  const locate = useLocation();
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);

  const playerRef = useRef<Player | null>(null);
  const currentVideoRef = useRef<Player | null>(null);
  const [videoJsOptions, setVideoJsOptions] = useState({
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    liveui: true,
    liveTracker: {
      liveTolerance: 5, // n초 미만일 때 liveui 숨김 (라이브 표시 관련)
      trackingThreshold: 10, // n초 이상 seek bar와 벌어질 때 모든 항목 live로 간주 (seek bar 관련)
    },
    // sources: [
    //   {
    //     src: URL.createObjectURL((mediaSource = new MediaSource())),
    //     type: CODEC,
    //   },
    // ],
  });

  function registerRecord(stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: CODEC,
      bitsPerSecond: 2000,
      videoBitsPerSecond: 500,
      audioBitsPerSecond: 500,
    });
    console.log("register");
    mediaRecorder.ondataavailable = async (data) => {
      const mediaArrayBuffer = await data.data.arrayBuffer();
      console.log("add chunk", countUploadChunk);
      streams.push(mediaArrayBuffer);
      // props.socket.sendFile(mediaArrayBuffer);
      countUploadChunk++;
      // videoBuffer.appendBuffer(mediaArrayBuffer);

      // @ts-ignore
      // setIsLive(playerRef.current?.liveTracker.isLive());
      console.log("record");
    };

    mediaRecorder.start();

    recordLoop = setInterval(() => {
      mediaRecorder.requestData();
    }, 500);
  }

  useEffect(() => {
    /* my video */
    (async () => {
      const currentVideo = currentVideoRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      (currentVideo?.tech().el() as HTMLVideoElement).srcObject = stream;
    })();
  }, []);

  useEffect(() => {
    socket.sendBinary(SIGNAL.ROOM, "create", {
      roomId: locate.state.roomId,
    });
    socket.sendBinary(SIGNAL.USER, "create", {
      roomId: locate.state.roomId,
    });
    socket.sendBinary(SIGNAL.USER, "update", {
      userData: {
        nickname: locate.state.nickname,
      },
    });

    start();

    return () => {
      clearInterval(recordLoop);
      clearInterval(chunkStreamLoop);
      mediaSource = new MediaSource();
      videoBuffer = undefined;
      streams;
      countUploadChunk;
      countDownloadChunk;
      socketDispatch({
        type: LIVE_SOCKET_ACTION.OUT,
        roomId: locate.state.roomId,
      });
    };
  }, []);

  async function start() {
    const player = playerRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoBuffer = mediaSource.addSourceBuffer(CODEC);

    registerRecord(stream);

    chunkStreamLoop = setInterval(() => {
      const stream = streams[countDownloadChunk];
      if (stream) {
        console.log("get chunk", countDownloadChunk);
        videoBuffer?.appendBuffer(stream);
        socket.sendBinary(SIGNAL.STREAM, "send", {
          stream: new Uint8Array(stream).toString(),
        });
        countDownloadChunk++;
      }
    }, 500);
  }

  const handleCurrentPlayerReady = (player) => {
    currentVideoRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <Stack direction='row' gap={5}>
      <Stack
        sx={{
          flex: 1,
        }}>
        <Stack gap={5}>
          <Stack gap={1}>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={20} fontWeight={700} gutterBottom>
                Current Video
              </Typography>
            </Box>
            <VideoJS
              playerRef={currentVideoRef}
              options={videoJsOptions}
              onReady={handleCurrentPlayerReady}
            />
          </Stack>
          <Stack gap={1}>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={20} fontWeight={700} gutterBottom>
                Live Video
              </Typography>
            </Box>
            <VideoJS
              playerRef={playerRef}
              options={videoJsOptions}
              onReady={handlePlayerReady}
              mediaSource={mediaSource}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          flex: 1,
        }}>
        <Box sx={{ flex: 1 }}>chattings</Box>
        <Box sx={{ flex: 1 }}>custom pannels</Box>
      </Stack>
    </Stack>
  );
}

export default RecordRoom;
