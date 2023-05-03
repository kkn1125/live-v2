import { Box } from "@mui/material";
import React from "react";

function CustomVideo({
  videoRef,
}: {
  videoRef: React.MutableRefObject<HTMLVideoElement | undefined>;
}) {
  return (
    <Box
      ref={videoRef}
      component='video'
      autoPlay
      playsInline
      controls
      preload='auto'
      // data-setup='{}'
      sx={{
        width: "100%",
        // flex: 1,
        height: "auto",
        backgroundSize: "contained",
        display: "flex",
        flexDirection: "column",
      }}
    />
  );
}

export default CustomVideo;
