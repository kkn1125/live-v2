import { Box, Chip, Stack, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles/createTheme";
import React from "react";
import PeopleIcon from "@mui/icons-material/People";

function MiniTip({
  badge,
  view,
  color = "info",
}: {
  badge: string;
  view: number;
  color?: "primary" | "secondary" | "error" | "warning" | "info";
}) {
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
          <Typography
            component='div'
            fontWeight={700}
            textTransform={"uppercase"}
            fontSize={(theme) => theme.typography.pxToRem(12)}>
            {badge}
          </Typography>
        </Stack>
        <Typography
          component={Stack}
          direction='row'
          alignItems='center'
          gap={1}
          fontSize={(theme) => theme.typography.pxToRem(12)}
          sx={{ flex: 1, px: 0.8, py: 0.2 }}>
          <PeopleIcon
            sx={{
              fontSize: (theme) => theme.typography.pxToRem(16),
            }}
          />{" "}
          {view.toLocaleString("ko")}
        </Typography>
      </Stack>
    </Box>
  );
}

export default MiniTip;
