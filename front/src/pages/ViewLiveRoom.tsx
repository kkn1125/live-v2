import { Box, Button, Chip, CircularProgress, Typography } from "@mui/material";
import Hls from "hls.js";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import Player from "video.js/dist/types/player";
import CustomVideo from "../components/moleculars/CustomVideo";
import PopupModal from "../components/moleculars/PopupModal";
import LiveCommerceLayout from "../components/templates/LiveCommerceLayout";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import {
  CODEC,
  INTERCEPT,
  LIVE_SOCKET_ACTION,
  SIGNAL,
  streaminRecordInterval,
} from "../util/global";

let mediaSource: MediaSource;
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;
let chunkFetchStreamLoop: NodeJS.Timer;
let chunkDownloadStreamLoop: NodeJS.Timer;
let streamPoint = 0;
let startPoint = 0;

const config = {
  fragLoadingTimeOut: 10000,
  fragLoadingMaxRetry: 3,
};

const hlsVideo = new Hls(config);

function ViewLiveRoom() {
  const videoRef = useRef<HTMLVideoElement>();
  const locate = useLocation();
  const params = useParams();
  const [isLive, setIsLive] = useState(false);
  const socket = useContext(LiveSocketContext);
  const [room, setRoom] = useState({});
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const navigate = useNavigate();
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState(0);
  const [isSeekable, setIsSeekable] = useState(false);
  const [isWrongPath, setIsWrongPath] = useState(false);
  // const [nickname, setNickname] = useState(
  //   locate.state?.nickname || "Guest-" + v4({})
  // );
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    mediaSource = new MediaSource();

    socket.ifActivated((activate) => {
      const video = videoRef.current as HTMLVideoElement;
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.onsourceopen = (e) => {
        videoBuffer = mediaSource.addSourceBuffer(CODEC);
        videoBuffer.mode = "sequence";
      };

      setTimeout(() => {
        chunkFetchStreamLoop = setInterval(() => {
          socket.sendBinary(SIGNAL.STREAM, "fetch", {
            chunkIndex: countDownloadChunk,
          });
        }, streaminRecordInterval);
        // try {
        //   hlsVideo.loadSource(
        //     `/hls/?roomId=41322d81-65f9-4220-8fc8-54ad0f3f3092&chunkIndex=${countDownloadChunk}`
        //   );
        //   countDownloadChunk++;
        // } catch (error) {}
      }, 1000);

      socket.on(SIGNAL.STREAM, (type, origin, data) => {
        // (videoBuffer as SourceBuffer).onupdateend = () => {
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
                }
                // console.log(videoRef.current?.currentTime);
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
        if (data.action === "join") {
          setRoom((room) => data.result.room);
        } else if (data.action === "out") {
          if (
            data.result.room.users.some((roomUser) => roomUser.id === user.id)
          ) {
            setRoom((room) => data.result.room);
          } else {
            setIsWrongPath(() => true);
          }
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
          if (data?.result?.user) {
            setUser((user) => data.result.user);
          }
        }
      });

      socket.on(SIGNAL.ROOM, (type, origin, data) => {
        if (data.action === "find") {
          const room = data.result.room;
          if (!room) {
            setIsWrongPath(() => true);
          }
        } else if (data.action === "delete") {
          setIsWrongPath(() => true);
        }
      });

      socket.on(INTERCEPT.ERROR, (type, origin) => {
        alert("오류가 발생했습니다.");

        clearInterval(chunkFetchStreamLoop);
        clearInterval(chunkDownloadStreamLoop);

        socketDispatch({
          type: LIVE_SOCKET_ACTION.OUT,
          roomId: params.roomId,
        });

        setIsWrongPath(() => true);
      });

      socket.on(INTERCEPT.CLOSE, (type, origin) => {
        clearInterval(chunkFetchStreamLoop);
        clearInterval(chunkDownloadStreamLoop);

        socketDispatch({
          type: LIVE_SOCKET_ACTION.OUT,
          roomId: params.roomId,
        });

        setIsWrongPath(() => true);
      });

      socket.sendBinary(SIGNAL.ROOM, "find", {
        roomId: params.roomId,
      });

      socket.sendBinary(SIGNAL.USER, "update", {
        nickname:
          locate.state?.nickname || "Guest" + Math.floor(Math.random() * 100),
      });

      socketDispatch({
        type: LIVE_SOCKET_ACTION.JOIN,
        roomId: params.roomId,
      });

      socket.sendBinary(SIGNAL.USER, "fetch");

      if (!params.roomId) {
        setIsWrongPath(() => true);
      }

      // TODO: 회원가입 기능 있을 시 닉네임 유지 설정 필요
      // 현재는 리로드하면 페이지 홈으로 가도록 설정
    });

    window.addEventListener("beforeunload", () => {
      outRoom();
    });

    return () => {
      clearInterval(chunkFetchStreamLoop);
      clearInterval(chunkDownloadStreamLoop);
      videoBuffer = undefined;
      countDownloadChunk = 0;
      streamPoint = 0;
      streams = [];
      outRoom();
      socket.off(SIGNAL.ROOM);
      socket.off(SIGNAL.STREAM);
      socket.off(SIGNAL.USER);
      socket.off(INTERCEPT.ERROR);
      socket.off(INTERCEPT.CLOSE);
    };
  }, []);

  function outRoom() {
    socketDispatch({
      type: LIVE_SOCKET_ACTION.OUT,
      roomId: params.roomId,
    });
  }

  const handleClosePopup = (e: MouseEvent) => {
    navigate("/");
  };

  function handleSeekToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = streamPoint;
    }
  }

  return isWrongPath ? (
    <Box
      sx={{
        height: "inherit",
        color: "#ffffff",
        backgroundColor: "#222222",
      }}>
      <PopupModal type='deleted' immediately handler={handleClosePopup} />
    </Box>
  ) : (
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
      {
        <LiveCommerceLayout
          room={room}
          user={user}
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
      }
    </Box>
  );
}

export default ViewLiveRoom;
