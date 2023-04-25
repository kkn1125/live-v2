import { Box, Chip, Stack, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles/createTheme";
import React from "react";

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
    <Box sx={{ ml: 2, mt: 2 }}>
      <Stack
        direction='row'
        gap={0.5}
        alignItems='center'
        sx={{
          position: "relative",
          display: "inline-flex",
          backgroundColor: "#ffffff56",
          zIndex: 1,
          borderRadius: 1,
          overflow: "hidden",
        }}>
        <Typography
          fontWeight={700}
          textTransform={"uppercase"}
          fontSize={(theme) => theme.typography.pxToRem(12)}
          sx={{
            backgroundColor: (theme) => theme.palette[color].main,
            px: 0.8,
            py: 0.1,
          }}>
          {badge}
        </Typography>
        <Typography
          fontSize={(theme) => theme.typography.pxToRem(12)}
          sx={{ flex: 1, px: 0.8, py: 0.2 }}>
          ▷ {view.toLocaleString("ko")}
        </Typography>
      </Stack>
    </Box>
  );
}

export default MiniTip;
