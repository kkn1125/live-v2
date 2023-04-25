import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { CODEC } from "../../util/global";

export const VideoJS = ({
  playerRef,
  options,
  onReady,
  mediaSource,
}: VideoJSType) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement(
        "video-js"
      ) as HTMLVideoElement;

      videoElement.classList.add(
        "vjs-big-play-centered",
        "vjs-live",
        "vjs-liveui"
      );

      if (mediaSource) {
        (videoElement as HTMLVideoElement).src =
          URL.createObjectURL(mediaSource);
      }

      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

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
    } else {
      const player = playerRef.current;
      player;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
      player.options({
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        liveui: true,
        liveTracker: {
          liveTolerance: 5, // n초 미만일 때 liveui 숨김 (라이브 표시 관련)
          trackingThreshold: 10, // n초 이상 seek bar와 벌어질 때 모든 항목 live로 간주 (seek bar 관련)
        },
        // sources: [
        //   {
        //     src: URL.createObjectURL((mediaSource = new MediaSource())),
        //     type: CODEC,
        //   },
        // ],
      });
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        (playerRef.current as any) = null;
      }
    };
  }, [playerRef]);

  return (
    <Box data-vjs-player>
      <Box ref={videoRef} />
    </Box>
  );
};

export default VideoJS;
