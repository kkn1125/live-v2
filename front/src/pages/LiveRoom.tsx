import { Box, Stack, Typography } from "@mui/material";
import React, { LegacyRef, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import VideoJS from "../components/moleculars/VideoJS";
import videojs from "video.js";
import { CODEC } from "../util/global";
import Player from "video.js/dist/types/player";

let mediaSource = new MediaSource();
let videoBuffer: SourceBuffer;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;

let recordLoop: NodeJS.Timer;
let chunkStreamLoop: NodeJS.Timer;

function RecordRoom() {
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
    (async () => {
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
          videoBuffer.appendBuffer(stream);
          countDownloadChunk++;
        }
      }, 500);
    })();

    return () => {
      clearInterval(recordLoop);
      clearInterval(chunkStreamLoop);
    };
  }, []);

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
      {/* <Stack
        sx={{
          flexShrink: 1,
          flexGrow: 0,
        }}>
        <Box sx={{ flex: 1 }}>
          <Typography>Current Video</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography>Live Video</Typography>
        </Box>
      </Stack> */}
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
