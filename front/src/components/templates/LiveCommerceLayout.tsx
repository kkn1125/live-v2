import { Stack, Box, Typography, keyframes, Button, Chip } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import axios from "axios";
import { MouseEvent, useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import LiveSocket from "../../model/LiveSocket";
import { INTERCEPT, SIGNAL } from "../../util/global";
import { convertUrlString } from "../../util/tool";
import BottomBar from "../moleculars/BottomBar";
import Chattings from "../moleculars/Chattings";
import LiveToolBar from "../moleculars/LiveToolBar";
import MiniTip from "../moleculars/MiniTip";
import PopupModal from "../moleculars/PopupModal";
import SlideTitle from "../moleculars/SlideTitle";
import Chat from "../organisms/Chat";

type URLs = string[];

interface LiveCommerceOptionTypes {
  room?: any;
  video?: React.ReactElement;
  loading?: boolean;
  isLive?: boolean;
  handleSeekToLive: () => void;
}

const LIVE_SIZE = {
  MIN_WIDTH: {
    xs: "100%",
    md: 360,
  },
  WIDTH: {
    xs: "100%",
    md: "56.25vh",
  },
  MIN_HEIGHT: 640,
};

function LiveCommerceLayout({
  video,
  room,
  loading,
  isLive,
  handleSeekToLive,
}: LiveCommerceOptionTypes) {
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const locate = useLocation();
  const navigate = useNavigate();
  const [src, setSrc] = useState();
  const iframeRef = useRef<HTMLIFrameElement | HTMLVideoElement>();
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });
  const [isWrongPath, setIsWrongPath] = useState(false);
  const [toggleChat, setToggleChat] = useState(false);
  const [link, setLink] = useState("");

  const handleClosePopup = (e: MouseEvent) => {
    navigate("/");
  };

  const immediatelyModal = (
    <PopupModal type='deleted' immediately handler={handleClosePopup} />
  );

  // axios
  //   .get(`/youtube/HZIcTZABMuc`, {})
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  useEffect(() => {
    if (iframeRef.current) {
      new ResizeObserver(() => {
        setSize(() => ({
          width: iframeRef.current?.clientWidth || 0,
          height: iframeRef.current?.clientHeight || 0,
        }));
      }).observe(iframeRef.current);
    }

    socket.on(SIGNAL.ROOM, (type, origin, data) => {
      if (data.action === "find") {
        const room = data.result.room;
        if (!room) {
          setIsWrongPath(() => true);
        } else {
          setLink(room.link);
        }
      } else if (data.action === "delete") {
        setIsWrongPath(() => true);
      } else if (data.action === "send/link") {
        setLink((link) => data.result.link);
      }
    });

    socket.on(INTERCEPT.ERROR, (type, origin) => {
      alert("오류가 발생했습니다.");
      setIsWrongPath(() => true);
    });

    socket.on(INTERCEPT.CLOSE, (type, origin) => {
      setIsWrongPath(() => true);
    });

    socket.sendBinary(SIGNAL.ROOM, "find", {
      roomId: locate.state?.roomId,
    });
    if (!locate.state?.roomId) {
      setIsWrongPath(() => true);
    }
  }, []);

  return isWrongPath ? (
    <>
      <Box
        sx={{
          height: "inherit",
          color: "#ffffff",
          backgroundColor: "#222222",
        }}>
        {immediatelyModal}
      </Box>
    </>
  ) : (
    <Stack
      alignItems='center'
      sx={{
        height: "100vh",
        color: "#ffffff",
        backgroundColor: "#000000",
        [`.MuiTypography-root`]: {
          zIndex: 5,
        },
      }}>
      <Stack
        sx={{
          position: "relative",
          overflow: "hidden",
          minWidth: LIVE_SIZE.MIN_WIDTH,
          width: LIVE_SIZE.WIDTH,
          height: "100%",
          minHeight: LIVE_SIZE.MIN_HEIGHT,
          backgroundColor: "#000000",
        }}>
        <Box sx={{ position: "absolute", top: 135, right: 10, zIndex: 100 }}>
          {!loading &&
            (isLive ? (
              <Chip label='LIVE' color='error' size='small' />
            ) : (
              <Chip
                component={Button}
                onClick={handleSeekToLive}
                color='info'
                label={"실시간 보기"}
                size='small'
              />
            ))}
        </Box>

        <LiveToolBar />
        <SlideTitle
          size={size}
          title='🌸 [솔가] 최대 70% 할인 🌸 봄맞이 한정 판매, 데일리 마스크!'
        />
        <MiniTip badge='live' view={room?.users?.length || 0} color={"error"} />
        <Stack
          sx={{
            flex: 1,
            position: "relative",
          }}>
          {/* <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
            }}
            component='iframe'
            height='100%'
            ref={iframeRef}
            src='https://www.youtube.com/embed/KBkc42lHd54'
            title='편집자가 퇴사할 뻔한 나이키 광고'
            frameBorder={0}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          /> */}
          {video}
          <Toolbar sx={{ flex: 1, pointerEvents: "none" }} />
          {/* <Typography
            fontWeight={700}
            sx={{
              pl: 2,
              color: (theme) => theme.palette.primary.main,
            }}>
            사은품 증정 이벤트 안내
          </Typography> */}
          {/* <Chat /> */}
          {link && (
            <Box
              // component={Link}
              // to={link}
              // target='_blank'
              sx={{
                p: 1,
                borderRadius: 0.5,
                backgroundColor: "#ffffff56",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                ["& a"]: {
                  textDecoration: "none",
                  color: "inherit",
                },
              }}
              dangerouslySetInnerHTML={{
                __html: `${convertUrlString(link)}`,
              }}
            />
          )}
          <Chattings />
          <Box
            sx={{
              zIndex: 1,
              px: 1,
            }}>
            <Typography
              fontSize={13}
              sx={{
                display: "inline-block",
                backgroundColor: "#ffffff56",
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                color: "inherit",
              }}>
              📢 라이브에서만 누릴 수 있는 혜택! 놓지지 마세요! ✨
            </Typography>
          </Box>
          {/* <Toolbar sx={{ pointerEvents: "none" }} /> */}
          {/* <BottomBar /> */}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default LiveCommerceLayout;
