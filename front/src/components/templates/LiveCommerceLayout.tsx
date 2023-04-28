import { Stack, Box, Typography, keyframes, Button, Chip } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import axios from "axios";
import Hls from "hls.js";
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
import LiveAddedLink from "../moleculars/LiveAddedLink";
import LiveToolBar from "../moleculars/LiveToolBar";
import MiniTip from "../moleculars/MiniTip";
import PopupModal from "../moleculars/PopupModal";
import SlideTitle from "../moleculars/SlideTitle";
import Chat from "../organisms/Chat";

// new Hls()
console.log(Hls.isSupported())

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
  const [toggleChat, setToggleChat] = useState(false);
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");

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
        if (room) {
          setLink(room.link);
          setDesc(room.desc);
        }
      } else if (data.action === "send/link") {
        setLink((link) => data.result.link);
        setDesc((desc) => data.result.desc);
      }
    });
  }, []);

  return (
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
        {isLive && (
          <Typography>
            {location.origin + location.pathname + "/" + room.id}
          </Typography>
        )}
        <LiveToolBar />
        <SlideTitle size={size} title={room.title} />
        <MiniTip badge='live' view={room?.users?.length || 0} color={"error"} />
        <Stack
          sx={{
            flex: 1,
            position: "relative",
          }}>
          {video}
          <Toolbar sx={{ flex: 1, pointerEvents: "none" }} />
          <LiveAddedLink link={link} desc={desc} />
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
        </Stack>
      </Stack>
    </Stack>
  );
}

export default LiveCommerceLayout;
