import { Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Player from "video.js/dist/types/player";
import CustomVideo from "../components/moleculars/CustomVideo";
import LiveCommerceLayout from "../components/templates/LiveCommerceLayout";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import { CODEC, INTERCEPT, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";

let mediaSource = new MediaSource();
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;
let chunkFetchStreamLoop: NodeJS.Timer;
let chunkDownloadStreamLoop: NodeJS.Timer;
let streamPoint = 0;

function ViewLiveRoom() {
  const videoRef = useRef<HTMLVideoElement>();
  const locate = useLocation();
  const [isLive, setIsLive] = useState(false);
  const socket = useContext(LiveSocketContext);
  const [room, setRoom] = useState({});
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const navigate = useNavigate();
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [isSeekable, setIsSeekable] = useState(false);

  useEffect(() => {
    socket.ifActivated((activate) => {
      const video = videoRef.current as HTMLVideoElement;
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.onsourceopen = (e) => {
        videoBuffer = mediaSource.addSourceBuffer(CODEC);
      };

      setTimeout(() => {
        chunkFetchStreamLoop = setInterval(() => {
          socket.sendBinary(SIGNAL.STREAM, "fetch", {
            chunkIndex: countDownloadChunk,
          });
        }, 50);
      }, 100);

      socket.on(SIGNAL.STREAM, (type, origin, data) => {
        // (videoBuffer as SourceBuffer).onupdateend = () => {
        if (data.action === "fetch") {
          const stream = data.result.stream;
          streamPoint = Number(data.result.streamPoint);
          if (stream && streamPoint !== countDownloadChunk) {
            const streamBuffer = new Uint8Array(
              stream.split(",").map((s) => Number(s))
            ).buffer;
            try {
              streams.push(streamBuffer);

              if (!videoBuffer?.updating) {
                videoBuffer?.appendBuffer(streamBuffer);
                // console.log(`loaded ${countDownloadChunk} stream`);
                // console.log(streamPoint, countDownloadChunk);
                setPercentage((countDownloadChunk / streamPoint) * 100);
                if (streamPoint > countDownloadChunk + 5) {
                  console.log("no live");
                  handleSeekToLive();
                  setLoading(() => true);
                } else {
                  setLoading(() => false);
                }
                // console.log(videoRef.current?.currentTime);
                if (
                  (videoRef.current?.currentTime || 0) + 5 <
                  streamPoint / 2
                ) {
                  setIsLive(false);
                } else {
                  setIsLive(true);
                }
                countDownloadChunk++;
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      });

      socket.on(SIGNAL.ROOM, (type, origin, data) => {
        if (data.action === "update/join" || data.action === "update/out") {
          setRoom((room) => data.result.room);
        }
      });

      socket.on(SIGNAL.USER, (type, origin, data) => {
        if (
          data.action === "update" ||
          data.action === "fetch" ||
          data.action === "delete"
        ) {
          if (data?.result?.room) {
            setRoom((room) => data.result.room);
          }
        }
      });

      socket.on(INTERCEPT.ERROR, (type, origin) => {
        clearInterval(chunkFetchStreamLoop);
        clearInterval(chunkDownloadStreamLoop);

        socketDispatch({
          type: LIVE_SOCKET_ACTION.OUT,
          roomId: locate.state.roomId,
        });
      });

      socket.on(INTERCEPT.CLOSE, (type, origin) => {
        clearInterval(chunkFetchStreamLoop);
        clearInterval(chunkDownloadStreamLoop);

        socketDispatch({
          type: LIVE_SOCKET_ACTION.OUT,
          roomId: locate.state.roomId,
        });
      });

      socketDispatch({
        type: LIVE_SOCKET_ACTION.JOIN,
        roomId: locate.state.roomId,
      });

      socket.sendBinary(SIGNAL.USER, "update", {
        userData: {
          nickname: locate.state.nickname,
        },
      });

      // TODO: 회원가입 기능 있을 시 닉네임 유지 설정 필요
      // 현재는 리로드하면 페이지 홈으로 가도록 설정
    });

    return () => {
      clearInterval(chunkFetchStreamLoop);
      clearInterval(chunkDownloadStreamLoop);
      videoBuffer = undefined;
      countDownloadChunk = 0;
      streamPoint = 0;
      socketDispatch({
        type: LIVE_SOCKET_ACTION.OUT,
        roomId: locate.state?.roomId,
      });
    };
  }, [mediaSource]);

  function handleSeekToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = streamPoint;
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
      }}>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            color: "#ffffff",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#000000a5",
            width: "100vw",
            height: "100vh",
            flexDirection: "column",
          }}>
          <Typography>🚀 Loading... {percentage.toFixed(2)}%</Typography>
          <CircularProgress color='inherit' />
        </Box>
      )}

      <LiveCommerceLayout
        room={room}
        loading={loading}
        isLive={isLive}
        handleSeekToLive={handleSeekToLive}
        video={
          <Box
            sx={{
              position: "absolute",
              width: "100%",
            }}>
            <CustomVideo videoRef={videoRef} />
          </Box>
        }
      />
    </Box>
  );
}

export default ViewLiveRoom;
