import { Box, Container, Stack, Toolbar } from "@mui/material";
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../organisms/Footer";
import Header from "../organisms/Header";

function Layout() {
  return (
    <Stack sx={{ height: "inherit" }}>
      <Header />
      <Toolbar />
      <Box component={Container} sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Stack>
  );
}

export default Layout;
