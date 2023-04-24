import { Box } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import VideoJS from "../components/moleculars/VideoJS";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import { CODEC, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";

let mediaSource = new MediaSource();
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;
let chunkStreamLoop: NodeJS.Timer;

function ViewLiveRoom() {
  const locate = useLocation();
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);

  console.log("locate", locate);
  const playerRef = useRef<Player | null>(null);
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

  useEffect(() => {
    if (playerRef.current) {
      setTimeout(() => {
        videoBuffer = mediaSource.addSourceBuffer(CODEC);
      }, 100);
    }

    socket.on(SIGNAL.STREAM, (type, origin, data) => {
      if (data.action === "fetch") {
        if (data.result.stream) {
          const stream = new Uint8Array(
            data.result.stream.split(",").map((s) => Number(s))
          ).buffer;
          streams.push(stream);

          videoBuffer?.appendBuffer(stream);

          console.log(`loaded ${countDownloadChunk} stream`);
          countDownloadChunk++;
        }
      } else if (data.action === "fetch/streams") {
        if (data.result.streams) {
          const streamList = data.result.streams;

          for (let dummyStream of streamList) {
            const stream = new Uint8Array(
              dummyStream.split(",").map((s) => Number(s))
            ).buffer;
            streams.push(stream);
            videoBuffer?.appendBuffer(stream);
            console.log(`loaded ${countDownloadChunk} stream`);
            countDownloadChunk++;
          }
        }
      }
    });

    socketDispatch({
      type: LIVE_SOCKET_ACTION.JOIN,
      roomId: locate.state.roomId,
    });

    socket.sendBinary(SIGNAL.STREAM, "fetch/streams");

    chunkStreamLoop = setInterval(() => {
      socket.sendBinary(SIGNAL.STREAM, "fetch", {
        chunkIndex: countDownloadChunk,
      });
    }, 500);

    return () => {
      clearInterval(chunkStreamLoop);
    };
  }, []);

  return (
    <Box>
      <VideoJS
        playerRef={playerRef}
        options={videoJsOptions}
        onReady={handlePlayerReady}
        mediaSource={mediaSource}
      />
    </Box>
  );
}

export default ViewLiveRoom;
