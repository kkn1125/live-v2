import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import CustomVideo from "../components/moleculars/CustomVideo";
import VideoJS from "../components/moleculars/VideoJS";
import Chat from "../components/organisms/Chat";
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

let flag = false;

function ViewLiveRoom() {
  // const videoPlay = useRef<(value: any) => void>(() => {});
  const videoRef = useRef<HTMLVideoElement>();
  const locate = useLocation();
  const [isLive, setIsLive] = useState(false);
  const socket = useContext(LiveSocketContext);
  const [room, setRoom] = useState({});
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const navigate = useNavigate();
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [percentage, setPercentage] = useState(0);

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
    // if (playerRef.current) {
    //   setTimeout(() => {
    //   }, 100);
    // }

    socket.ifActivated((activate) => {
      console.log(9123123);
      const video = videoRef.current as HTMLVideoElement;
      video.src = URL.createObjectURL(mediaSource);

      mediaSource.onsourceopen = (e) => {
        console.log(123123);
        videoBuffer = mediaSource.addSourceBuffer(CODEC);
      };

      setTimeout(() => {
        chunkFetchStreamLoop = setInterval(() => {
          socket.sendBinary(SIGNAL.STREAM, "fetch", {
            chunkIndex: countDownloadChunk,
          });
          // setIsLive(() =>
          //   // @ts-ignore
          //   playerRef.current?.liveTracker.isLive()
          // );
        }, 50);
        // };
        // };
      }, 100);

      socket.on(SIGNAL.STREAM, (type, origin, data) => {
        // (videoBuffer as SourceBuffer).onupdateend = () => {
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
              console.log(`loaded ${countDownloadChunk} stream`);
              console.log(streamPoint, countDownloadChunk);
              setPercentage((countDownloadChunk / streamPoint) * 100);
              if (streamPoint > countDownloadChunk + 5) {
                console.log("no live");
                handleSeekToLive();
                setLoading(() => true);
              } else {
                setLoading(() => false);
              }
              if (countDownloadChunk + 5 < streamPoint) {
                setIsLive(false);
              }
              countDownloadChunk++;
            }
          } catch (e) {
            console.log(e);
            // socketDispatch({
            //   type: LIVE_SOCKET_ACTION.OUT,
            //   roomId: locate.state.roomId,
            // });
            // navigate("/");
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
      socketDispatch({
        type: LIVE_SOCKET_ACTION.OUT,
        roomId: locate.state?.roomId,
      });
    };
  }, [mediaSource]);

  function handleSeekToLive() {
    // @ts-ignore
    // playerRef.current.liveTracker.seekToLiveEdge_();
    if (videoRef.current) {
      videoRef.current.currentTime = countDownloadChunk - 1;
    }
  }

  // function isVideoPlay() {
  //   return new Promise((resolve) => ((videoPlay.current as any) = resolve));
  // }

  {
    /* <Box
        sx={{
          width: 500,
        }}>
        {!isLive && (
          <Button
            variant='contained'
            color='error'
            size='small'
            sx={{
              position: "absolute",
              top: 100,
              right: 10,
            }}
            onClick={handleSeekToLive}>
            실시간 보기
          </Button>
        )}
      </Box>
      <Chat /> */
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
      {isLive && "live"}
      <LiveCommerceLayout
        room={room}
        video={
          <Box
            sx={{
              position: "absolute",
              width: "100%",
            }}>
            <CustomVideo videoRef={videoRef} />
          </Box>
          // <VideoJS
          //   playerRef={playerRef}
          //   options={videoJsOptions}
          //   onReady={handlePlayerReady}
          //   mediaSource={mediaSource}
          // />
        }
      />
    </Box>
  );
}

export default ViewLiveRoom;
