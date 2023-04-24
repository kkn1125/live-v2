import { Box, Stack, styled } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { APP_BRAND_NAME } from "../../util/global";

function LiveHeader() {
  const navigate = useNavigate();

  return (
    <Stack
      sx={{
        p: 3,
        backgroundColor: "#121212",
        color: "#ffffff",
      }}>
      <Box>
        <Box component={Link} to='/'>
          <Box
            component='img'
            id='logo'
            src='/images/ander_white.png'
            alt={APP_BRAND_NAME}
            sx={{
              height: 30,
              width: "auto",
            }}
          />
        </Box>
      </Box>
      <Box></Box>
      <Box></Box>
    </Stack>
  );
}

export default LiveHeader;
