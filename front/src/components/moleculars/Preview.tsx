import { Box } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import {
  CODEC,
  INTERCEPT,
  LIVE_SOCKET_ACTION,
  SIGNAL,
  streaminRecordInterval,
} from "../../util/global";
import CustomVideo from "./CustomVideo";

let mediaSource: MediaSource;
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;
let chunkFetchStreamLoop: NodeJS.Timer;
let streamPoint = 0;
let startPoint = 0;

let sendTiming: NodeJS.Timer;

const config = {
  fragLoadingTimeOut: 10000,
  fragLoadingMaxRetry: 3,
};

function Preview({ roomId }: { roomId: string }) {
  const videoRef = useRef<HTMLVideoElement>();
  const locate = useLocation();
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isWrongPath, setIsWrongPath] = useState(false);

  useEffect(() => {
    mediaSource = new MediaSource();

    socket.ifActivated((activate) => {
      const video = videoRef.current as HTMLVideoElement;
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.onsourceopen = (e) => {
        videoBuffer = mediaSource.addSourceBuffer(CODEC);
        videoBuffer.mode = "sequence";
      };

      sendTiming = setTimeout(() => {
        chunkFetchStreamLoop = setInterval(() => {
          console.log("송신");
          socket.sendBinary(SIGNAL.STREAM, "fetch", {
            chunkIndex: countDownloadChunk,
            roomId: roomId,
          });
        }, streaminRecordInterval);
      }, 1000);

      socket.on(SIGNAL.STREAM, (type, origin, data) => {
        if (data.action === "fetch") {
          const stream = data.result.stream;
          streamPoint = Number(data.result.streamPoint);

          /* real-time video seeking point */
          if (countDownloadChunk === 0) {
            startPoint = countDownloadChunk = streamPoint - 1;
          }

          if (stream && streamPoint !== countDownloadChunk) {
            const streamBuffer = new Uint8Array(
              stream.split(",").map((s) => Number(s))
            ).buffer;
            try {
              streams.push(streamBuffer);

              if (videoBuffer && !videoBuffer?.updating) {
                videoBuffer.appendBuffer(streamBuffer);
                // console.log(`loaded ${countDownloadChunk} stream`);
                console.log(streamPoint, countDownloadChunk, startPoint);
                setPercentage((countDownloadChunk / streamPoint) * 100);
                if (streamPoint > countDownloadChunk + 5) {
                  console.log("no live");
                  handleSeekToLive();
                  setLoading(() => true);
                } else {
                  setLoading(() => false);
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.muted = true;
                      videoRef.current.play();
                    }
                  }, 100);
                }
                countDownloadChunk++;

                const timeIntervalRatio = 1000 / streaminRecordInterval;
                const currentTimeGap = (videoRef.current?.currentTime || 0) + 5;
                const isLivePoint = !(
                  currentTimeGap + startPoint / timeIntervalRatio <
                  streamPoint / timeIntervalRatio
                );
                console.log(currentTimeGap);
                console.log(streamPoint);
                setIsLive(isLivePoint);
              }
            } catch (e: any) {
              console.log(e.status);
              console.log(e.code);
              console.log(e.message);
              console.log(e);
              if (e.code === 11) {
              }
            }
          }
        }
      });

      socket.on(SIGNAL.ROOM, (type, origin, data) => {
        console.log("room type", data);
      });

      socket.on(SIGNAL.USER, (type, origin, data) => {});

      socket.on(SIGNAL.ROOM, (type, origin, data) => {});

      socket.on(INTERCEPT.ERROR, (type, origin) => {
        alert("오류가 발생했습니다.");

        clearTimeout(sendTiming);
        clearInterval(chunkFetchStreamLoop);
      });

      socket.on(INTERCEPT.CLOSE, (type, origin) => {
        clearTimeout(sendTiming);
        clearInterval(chunkFetchStreamLoop);
      });

      socket.sendBinary(SIGNAL.ROOM, "find", {
        roomId: roomId,
      });

      socket.sendBinary(SIGNAL.USER, "update", {
        nickname:
          locate.state?.nickname || "Guest" + Math.floor(Math.random() * 100),
      });

      socket.sendBinary(SIGNAL.USER, "fetch");

      if (!roomId) {
        setIsWrongPath(() => true);
      }

      // TODO: 회원가입 기능 있을 시 닉네임 유지 설정 필요
      // 현재는 리로드하면 페이지 홈으로 가도록 설정
    });

    /* TODO: 여기서 return 대신 상위 컴포넌트에서 핸들러 받아 초기화 해야함 - 2023-05-09 19:59:29 */
    /* FEAT: 안해도 됨 2023-05-10 17:35:34 */

    return () => {
      console.log("제거!");
      clearTimeout(sendTiming);
      clearInterval(chunkFetchStreamLoop);
      videoBuffer = undefined;
      countDownloadChunk = 0;
      streamPoint = 0;
      streams = [];
      socket.off(SIGNAL.ROOM);
      socket.off(SIGNAL.STREAM);
      socket.off(SIGNAL.USER);
      socket.off(INTERCEPT.ERROR);
      socket.off(INTERCEPT.CLOSE);
    };
  }, []);

  function handleSeekToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = streamPoint;
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
      }}>
      <CustomVideo videoRef={videoRef} />
    </Box>
  );
}

export default Preview;
