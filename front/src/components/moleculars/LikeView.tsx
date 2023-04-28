import { Box, Chip, Stack, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles/createTheme";
import React, { useContext, useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { DataLiveSocketEventListenerType, SIGNAL } from "../../util/global";

function LikeView({
  color = "info",
}: {
  color?: "primary" | "secondary" | "error" | "warning" | "info";
}) {
  const socket = useContext(LiveSocketContext);
  const [room, setRoom] = useState<any>({});
  const [likes, setLikes] = useState(0);

  const likeHandler: DataLiveSocketEventListenerType = (type, origin, data) => {
    if (data.action === "like") {
      setRoom(data.result.room);
      setLikes(data.result.likeCounter);
    }
  };

  useEffect(() => {
    socket.on(SIGNAL.ROOM, likeHandler);
    return () => {
      socket.removeListener(SIGNAL.ROOM, likeHandler);
    };
  }, []);
  return (
    <Box sx={{ ml: 2 }}>
      <Stack
        direction='row'
        sx={{
          position: "relative",
          display: "inline-flex",
          backgroundColor: "#ffffff56",
          zIndex: 1,
          borderRadius: 1,
          overflow: "hidden",
        }}>
        <Stack
          direction='row'
          alignItems='center'
          sx={{
            backgroundColor: (theme) => theme.palette.error.main,
            px: 0.6,
          }}>
          <FavoriteIcon
            sx={{
              fontSize: 16,
            }}
          />
        </Stack>
        <Typography
          component={Stack}
          direction='row'
          alignItems='center'
          gap={1}
          fontSize={(theme) => theme.typography.pxToRem(12)}
          sx={{ flex: 1, px: 0.8, py: 0.2 }}>
          {likes.toLocaleString("ko")}
        </Typography>
      </Stack>
    </Box>
  );
}

export default LikeView;
