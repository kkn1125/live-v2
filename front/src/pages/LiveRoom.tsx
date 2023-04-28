import PhotoCameraFrontIcon from "@mui/icons-material/PhotoCameraFront";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import Chattings from "../components/moleculars/Chattings";
import CustomVideo from "../components/moleculars/CustomVideo";
import LikeView from "../components/moleculars/LikeView";
import LiveAddedLink from "../components/moleculars/LiveAddedLink";
import LiveAddLink from "../components/moleculars/LiveAddLink";
import MiniTip from "../components/moleculars/MiniTip";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../context/LiveSocketProvider";
import {
  CODEC,
  DataLiveSocketEventListenerType,
  LIVE_SOCKET_ACTION,
  SIGNAL,
} from "../util/global";
import { timerConvert } from "../util/tool";

let mediaSource: MediaSource;
let videoBuffer: SourceBuffer | undefined = undefined;
let streams: ArrayBuffer[] = [];
let countUploadChunk = 0;
let countDownloadChunk = 0;
let isStartedLive: number;
let streamPoint = 0;

let recordLoop: NodeJS.Timer;
let chunkStreamLoop: NodeJS.Timer;
let streamingTime: NodeJS.Timer;

function RecordRoom() {
  const navigate = useNavigate();
  const [isLiveStart, setIsLiveStart] = useState(false);
  const [readyLive, setReadyLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>();
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const [room, setRoom] = useState<any>({});
  const [startTime, setStartTime] = useState({
    h: 1,
    m: 1,
    s: 1,
  });
  const [roomInfo, setRoomInfo] = useState({
    roomId: "",
    title: "",
    nickname: "",
  });
  const [liveTime, setLiveTime] = useState(0);
  const idRef = useRef("");
  const titleRef = useRef("");
  const nicknameRef = useRef("");
  const [isLive, setIsLive] = useState(false);
  const [startLiveTime, setStartLiveTime] = useState(0);
  const nowRef = useRef(new Date());
  const currentVideoRef = useRef<HTMLVideoElement>();
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");

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
      countUploadChunk++;
      console.log("record");
    };

    mediaRecorder.start();

    recordLoop = setInterval(() => {
      mediaRecorder.requestData();
    }, 500);
  }

  const roomHandler: DataLiveSocketEventListenerType = (type, origin, data) => {
    if (data.action === "create") {
      setRoom((room) => data.result.room);
    } else if (data.action === "join" || data.action === "out") {
      setRoom((room) => data.result.room);
    } else if (data.action === "send/link") {
      setLink(data.result.link);
      setDesc(data.result.desc);
    }
  };

  const streamHandler: DataLiveSocketEventListenerType = (
    type,
    origin,
    data
  ) => {
    if (data.action === "send") {
      streamPoint = Number(data.result.streamPoint);
    }
  };

  useEffect(() => {
    idRef.current = roomInfo.roomId;
    titleRef.current = roomInfo.title;
    nicknameRef.current = roomInfo.nickname;
  }, [roomInfo]);

  useEffect(() => {
    setRoomInfo((roomInfo) => Object.assign({ ...roomInfo }, { roomId: v4() }));

    mediaSource = new MediaSource();
    socket.on(SIGNAL.ROOM, roomHandler);

    socket.on(SIGNAL.STREAM, streamHandler);

    setStartTime({
      h: new Date().getHours(),
      m: new Date().getMinutes(),
      s: new Date().getSeconds(),
    });

    /* my video */
    if (mediaSource) {
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

      window.addEventListener("beforeunload", () => {
        deleteRoom();
      });
    }

    return () => {
      clearInterval(recordLoop);
      clearInterval(chunkStreamLoop);
      clearInterval(streamingTime);
      cancelAnimationFrame(isStartedLive);
      streams = [];
      countUploadChunk = 0;
      countDownloadChunk = 0;
      deleteRoom();
      socket.removeListener(SIGNAL.ROOM, roomHandler);
      socket.removeListener(SIGNAL.STREAM, streamHandler);
    };
  }, []);

  function deleteRoom() {
    socketDispatch({
      type: LIVE_SOCKET_ACTION.DELETE_ROOM,
      roomId: idRef.current,
    });
  }

  async function connectSocket() {
    console.log("🚀socket", socket);
    socket.rooms.create(idRef.current, titleRef.current);

    socket.users.update({
      nickname: nicknameRef.current,
    });
    // socket.sendBinary(SIGNAL.USER, "update", {
    //   userData: {
    //     nickname: nicknameRef.current,
    //   },
    // });
  }

  async function start() {
    setIsLiveStart(true);

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

          if ((videoRef.current?.currentTime || 0) + 5 < streamPoint / 2) {
            setIsLive(false);
          } else {
            setIsLive(true);
          }

          countDownloadChunk++;
        }
      }
    }, 500);

    streamingTime = setInterval(() => {
      setLiveTime((liveTime) => liveTime + 1);
    }, 1000);
  }

  function handleStartTime(
    e: SelectChangeEvent<number>,
    child: React.ReactNode
  ) {
    let name = "h";
    switch ((child as React.ReactElement).props.children[1]) {
      case "시":
        name = "h";
        break;
      case "분":
        name = "m";
        break;
      case "초":
        name = "s";
        break;
    }
    setStartTime((startTime) => ({
      ...startTime,
      [name]: e.target.value,
    }));
  }

  function prepareLive() {
    console.log("live start");
    setReadyLive(true);
    let count = 0;
    function startAtLiveTime(time) {
      const date = new Date();
      const h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
      const currentTimeNumber = h * 60 * 60 + m * 60 + s;
      const startTimeNumber =
        startTime.h * 60 * 60 + startTime.m * 60 + startTime.s;
      if (count % 60 === 0) {
        // console.log(
        //   "라이브 방송까지 남은 시간:",
        //   startTimeNumber - currentTimeNumber
        // );
        setStartLiveTime(startTimeNumber - currentTimeNumber);
      }
      if (startTimeNumber - currentTimeNumber <= 0) {
        cancelAnimationFrame(isStartedLive);
        connectSocket().then(() => {
          start().catch((e) => {
            socketDispatch({
              type: LIVE_SOCKET_ACTION.OUT,
              roomId: roomInfo.roomId,
            });
            navigate("/");
          });
        });
      } else {
        isStartedLive = requestAnimationFrame(startAtLiveTime);
      }
      count++;
    }
    startAtLiveTime(0);
  }

  function handleSeekToLive() {
    if (videoRef.current) {
      videoRef.current.currentTime = streamPoint;
    }
  }

  function handleRoomInfo(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    setRoomInfo((roomInfo) =>
      Object.assign(
        { ...roomInfo },
        {
          [target.name]: target.value,
        }
      )
    );
  }

  return (
    <Stack>
      <Stack
        direction='row'
        gap={2}
        sx={{
          px: 3,
        }}>
        <Stack
          sx={{
            flex: 1,
          }}>
          <Stack gap={5}>
            <Stack
              direction='row'
              gap={3}
              sx={{
                position: "relative",
              }}>
              <Stack gap={1} sx={{ width: 300 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontSize={20} fontWeight={700}>
                    Current Video
                  </Typography>
                </Box>
                <CustomVideo videoRef={currentVideoRef} />
              </Stack>
              <Stack gap={1} sx={{ width: 500, position: "relative" }}>
                <Stack direction='row' alignItems='center' sx={{ flex: 1 }}>
                  <Typography fontSize={20} fontWeight={700}>
                    Live Video
                  </Typography>
                  <MiniTip
                    badge='live'
                    view={room?.users?.length || 0}
                    color={"error"}
                  />
                  <Divider
                    orientation='vertical'
                    sx={{
                      mx: 2,
                      borderColor: "white",
                    }}
                  />
                  <Typography>{timerConvert(liveTime)}</Typography>
                  <LikeView />
                </Stack>
                <CustomVideo videoRef={videoRef} />
                {isLiveStart && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 10,
                      zIndex: 100,
                    }}>
                    {isLive ? (
                      <Chip label='LIVE' color='error' size='small' />
                    ) : (
                      <Chip
                        component={Button}
                        onClick={handleSeekToLive}
                        color='info'
                        label={"실시간 보기"}
                        size='small'
                      />
                    )}
                  </Box>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        {isLiveStart ? (
          <Stack
            sx={{
              flex: 1,
            }}>
            {/* <LiveAddedLink link={link} desc={desc} /> */}
            {isLiveStart && (
              <Typography>
                {location.origin +
                  location.pathname +
                  "/" +
                  (roomInfo.roomId || "")}
              </Typography>
            )}
            <LiveAddLink />
            <Box sx={{ flex: 1 }}>
              <Chattings userNickname={roomInfo.nickname} />
            </Box>
          </Stack>
        ) : (
          <Stack
            sx={{
              flex: 1,
            }}>
            <Box sx={{ flex: 1 }}>
              <Alert>
                <AlertTitle>라이브 송출 세팅 안내</AlertTitle>
                라이브 송출을 위해 시작 시간과 룸 제목을 설정해주세요!
              </Alert>
            </Box>
            <Stack
              gap={1}
              sx={{
                flex: 1,
                ["& .MuiInputBase-root"]: {
                  backgroundColor: "#ffffffa6",
                },
                ["& input"]: {
                  color: "#ffffff",
                },
              }}>
              <Typography>라이브 룸 아이디</Typography>
              <TextField
                name='id'
                size='small'
                value={roomInfo.roomId}
                disabled
              />
              <Typography>라이브 룸 제목</Typography>
              <TextField
                name='title'
                size='small'
                value={roomInfo.title}
                onChange={handleRoomInfo}
              />
              <Typography>송출자 닉네임</Typography>
              <TextField
                name='nickname'
                size='small'
                value={roomInfo.nickname}
                onChange={handleRoomInfo}
              />
              <Typography>라이브 예정 시간</Typography>
              <Stack direction='column'>
                <Stack direction='row' gap={0.5}>
                  <Select
                    size='small'
                    disabled={readyLive}
                    // inputRef={hourRef}
                    onChange={handleStartTime}
                    value={startTime.h}
                    label='hour'>
                    {new Array(24).fill(0).map((a, i) => (
                      <MenuItem
                        key={i}
                        value={i}
                        disabled={nowRef.current.getHours() > i}>
                        {i}시
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    size='small'
                    disabled={readyLive}
                    // inputRef={minRef}
                    onChange={handleStartTime}
                    value={startTime.m}
                    label='minute'>
                    {new Array(60).fill(0).map((a, i) => (
                      <MenuItem
                        key={i}
                        value={i}
                        disabled={
                          startTime.h <= nowRef.current.getHours() &&
                          nowRef.current.getMinutes() > i
                        }>
                        {i}분
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    size='small'
                    disabled={readyLive}
                    // inputRef={secRef}
                    onChange={handleStartTime}
                    value={startTime.s}
                    label='second'>
                    {new Array(60).fill(0).map((a, i) => (
                      <MenuItem
                        key={i}
                        value={i}
                        disabled={
                          startTime.h <= nowRef.current.getHours() &&
                          startTime.m <= nowRef.current.getMinutes() &&
                          nowRef.current.getMinutes() > i
                        }>
                        {i}초
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={prepareLive}
                    disabled={readyLive}
                    sx={{
                      whiteSpace: "nowrap",
                    }}>
                    <PhotoCameraFrontIcon
                      sx={{
                        fontSize: (theme) => theme.typography.pxToRem(24),
                      }}
                    />
                    라이브 시작
                  </Button>
                </Stack>
              </Stack>
              {readyLive && (
                <Typography>
                  라이브 방송 송출까지 남은 시간
                  <strong style={{ marginLeft: "0.5rem" }}>
                    {startLiveTime}초
                  </strong>
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default RecordRoom;
