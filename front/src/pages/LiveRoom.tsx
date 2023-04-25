import { Box, Button, Stack, TextField, Typography } from "@mui/material";
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
import Chat from "../components/organisms/Chat";
import CustomVideo from "../components/moleculars/CustomVideo";
import Chattings from "../components/moleculars/Chattings";
import MiniTip from "../components/moleculars/MiniTip";

let mediaSource = new MediaSource();
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;

let recordLoop: NodeJS.Timer;
let chunkStreamLoop: NodeJS.Timer;

function RecordRoom() {
  const videoRef = useRef<HTMLVideoElement>();
  const linkRef = useRef<HTMLInputElement>();
  const locate = useLocation();
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const [room, setRoom] = useState<any>({});
  // const playerRef = useRef<Player | null>(null);
  const currentVideoRef = useRef<HTMLVideoElement>();
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
      const currentVideo = currentVideoRef.current as HTMLVideoElement;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      currentVideo.srcObject = stream;

      const video = videoRef.current as HTMLVideoElement;
      video.src = URL.createObjectURL(mediaSource);
    })();
  }, []);

  useEffect(() => {
    socket.on(SIGNAL.USER, (type, origin, data) => {
      if (
        data.action === "create" ||
        data.action === "update" ||
        data.action === "delete"
      ) {
        setRoom((room) => data.result.room);
      }
    });

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
    // const player = playerRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    registerRecord(stream);

    videoBuffer = mediaSource.addSourceBuffer(CODEC);

    chunkStreamLoop = setInterval(() => {
      if (videoBuffer) {
        const stream = streams[countDownloadChunk];
        if (stream) {
          console.log("get chunk", countDownloadChunk);
          videoBuffer?.appendBuffer(stream);
          socket.sendBinary(SIGNAL.STREAM, "send", {
            stream: new Uint8Array(stream).toString(),
          });
          countDownloadChunk++;
        }
      }
    }, 500);
  }

  function handleAddLink() {
    const linkEl = linkRef.current as HTMLInputElement;
    socket.sendBinary(SIGNAL.ROOM, "send/link", {
      link: linkEl.value,
    });
    linkEl.value = "";
  }
  function handleAddLinkEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleAddLink();
    }
  }

  return (
    <Stack
      direction='row'
      gap={5}
      sx={{
        px: 3,
      }}>
      <Stack
        sx={{
          flex: 1,
        }}>
        <Stack gap={5}>
          <Typography fontWeight={700}>
            Room Session: {locate.state.roomId}
          </Typography>
          <Stack gap={1}>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={20} fontWeight={700} gutterBottom>
                Current Video
              </Typography>
            </Box>
            {/* <VideoJS
              playerRef={currentVideoRef}
              options={videoJsOptions}
              onReady={handleCurrentPlayerReady}
            /> */}
            <CustomVideo videoRef={currentVideoRef} />
          </Stack>
          <Stack gap={1}>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={20} fontWeight={700} gutterBottom>
                Live Video
              </Typography>
              <MiniTip
                badge='live'
                view={room?.users?.length || 0}
                color={"error"}
              />
            </Box>
            <CustomVideo videoRef={videoRef} />
            {/* <VideoJS
              playerRef={playerRef}
              options={videoJsOptions}
              onReady={handlePlayerReady}
              mediaSource={mediaSource}
            /> */}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          flex: 1,
        }}>
        <Box sx={{ flex: 1 }}>
          <Typography fontSize={20} fontWeight={700}>
            🔗 링크 등록
          </Typography>
          <Stack direction='row'>
            <TextField
              inputRef={linkRef}
              size='small'
              fullWidth
              sx={{
                flex: 1,
                ["& .MuiInputBase-root"]: {
                  backgroundColor: "#56565656",
                },
                ["& input"]: {
                  color: "#ffffff",
                },
              }}
              onKeyDown={handleAddLinkEnter}
            />
            <Button variant='contained' color='success' onClick={handleAddLink}>
              등록
            </Button>
          </Stack>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Chattings />
        </Box>
      </Stack>
    </Stack>
  );
}

export default RecordRoom;
