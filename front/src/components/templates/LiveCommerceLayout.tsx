import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import LiveAddedLink from "../moleculars/LiveAddedLink";
import LiveToolBar from "../moleculars/LiveToolBar";
import MiniTip from "../moleculars/MiniTip";
import SlideTitle from "../moleculars/SlideTitle";
import ViewerChatBox from "../moleculars/ViewerChatBox";

type URLs = string[];

interface LiveCommerceOptionTypes {
  room?: any;
  user?: any;
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
  user,
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

  useEffect(() => {
    if (iframeRef.current) {
      new ResizeObserver(() => {
        setSize(() => ({
          width: iframeRef.current?.clientWidth || 0,
          height: iframeRef.current?.clientHeight || 0,
        }));
      }).observe(iframeRef.current);
    }
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

          <Box sx={{ zIndex: 100 }}>
            <LiveAddedLink />
            <ViewerChatBox user={user} />
          </Box>

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
