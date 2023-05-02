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
      data-setup='{}'
      sx={{ width: "inherit", height: "100%", backgroundSize: "contained" }}
    />
  );
}

export default CustomVideo;
