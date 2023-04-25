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
      sx={{ width: "inherit", height: "100%" }}
    />
  );
}

export default CustomVideo;
