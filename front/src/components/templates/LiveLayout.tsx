import { Stack, Box, Container, Toolbar } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import LiveHeader from "../organisms/LiveHeader";

function LiveLayout() {
  return (
    <Stack sx={{ backgroundColor: "#121212", color: "#ffffff" }}>
      <LiveHeader />
      <Toolbar />
      <Box component={Container}>
        <Outlet />
      </Box>
    </Stack>
  );
}

export default LiveLayout;
