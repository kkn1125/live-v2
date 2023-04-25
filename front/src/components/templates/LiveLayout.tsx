import { Stack, Box, Container, Toolbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LiveHeader from "../organisms/LiveHeader";

function LiveLayout() {
  const locate = useLocation();
  const [isLiveRoom, setIsLiveRoom] = useState(false);
  useEffect(() => {
    if (locate.pathname === "/live") {
      setIsLiveRoom(true);
    }
  }, []);
  return (
    <Stack>
      {isLiveRoom && <LiveHeader />}
      <Box sx={{ backgroundColor: "#121212", color: "#ffffff" }}>
        <Outlet />
      </Box>
    </Stack>
  );
}

export default LiveLayout;
