import { Box } from "@mui/material";
import React from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

export const VideoJS = ({ options, onReady }) => {
  const videoRef = React.useRef<HTMLElement>(null);
  const playerRef = React.useRef<Player>(null);

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add(
        "vjs-big-play-centered",
        "liveui",
        "video-js",
        "vjs-theme-sea"
      );
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      if (playerRef.current) {
        const player = ((playerRef.current as any) = videojs(
          videoElement,
          options,
          () => {
            videojs.log("player is ready");
            onReady && onReady(player);
          }
        ));

        // You could update an existing player in the `else` block here
        // on prop change, for example:
      }
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        (playerRef.current as any) = null;
      }
    };
  }, [playerRef]);

  return (
    <Box data-vjs-player sx={{ width: 640, height: 480 }}>
      <Box ref={videoRef} sx={{ width: 640, height: 480 }} />
    </Box>
  );
};

export default VideoJS;
