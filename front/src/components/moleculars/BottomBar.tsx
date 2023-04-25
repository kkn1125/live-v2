import React, { useEffect, useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { Box, Slide, Typography } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import RestoreIcon from "@mui/icons-material/Restore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PictureInPictureIcon from "@mui/icons-material/PictureInPicture";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import SwitchVideoIcon from "@mui/icons-material/SwitchVideo";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

export default function BottomBar({}) {
  const [inArea, setInArea] = useState(false);
  const [value, setValue] = React.useState("recents");

  const [fullscreen, setFullscreen] = useState(false);
  const handleToggleFullScreen = () => {
    setFullscreen(!fullscreen);
    // toggleFullscreen();
  };
  // const mySessionId = sessionId;
  // const localUser = user;

  const handleChange = (event: any, newValue: React.SetStateAction<string>) => {
    setValue(newValue);
  };

  function nearDetect(e: { clientY: number }) {
    const isArea = e.clientY > innerHeight - 70;

    setInArea(isArea);
  }

  useEffect(() => {
    window.addEventListener("mousemove", nearDetect);
    return () => {
      window.removeEventListener("mousemove", nearDetect);
    };
  }, []);

  return (
    <>
      <Box
        sx={{
          margin: "auto",
          color: "inherit",
          zIndex: 1,
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
          backgroundColor: "#ffffff56",
          px: 3,
          pt: 1,
          position: "relative",
        }}>
        <MenuIcon fontSize={"small"} />
        <Box
          sx={{
            position: "absolute",
            left: "100%",
            bottom: 0,
            p: 1,
            overflow: "hidden",
            ["&::before"]: {
              content: '""',
              position: "absolute",
              bottom: 0,
              right: 0,
              borderBottomLeftRadius: "100%",
              boxShadow: "0 0 0 999999px #ffffff56",
              p: 1,
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: "100%",
            bottom: 0,
            p: 1,
            overflow: "hidden",
            ["&::before"]: {
              content: '""',
              position: "absolute",
              bottom: 0,
              right: 0,
              borderBottomRightRadius: "100%",
              boxShadow: "0 0 0 999999px #ffffff56",
              p: 1,
            },
          }}
        />
      </Box>
      <Slide in={inArea} timeout={100} direction='up'>
        <BottomNavigation
          sx={{
            zIndex: 1,
            bottom: 0,
            position: "absolute",
            left: 0,
            right: 0,
          }}
          value={value}
          onChange={handleChange}>
          {/* <BottomNavigationAction
            onClick={micStatusChanged}
            label='MicStatusChanged'
            value='micStatusChanged'
            icon={
              localUser !== undefined && localUser.isAudioActive() ? (
                <MicIcon />
              ) : (
                <MicOffIcon color='secondary' />
              )
            }
          />
          <BottomNavigationAction
            onClick={camStatusChanged}
            label='CamStatusChanged'
            value='camStatusChanged'
            icon={
              localUser !== undefined && localUser.isVideoActive() ? (
                <VideocamIcon />
              ) : (
                <VideocamOffIcon color='secondary' />
              )
            }
          />
          <BottomNavigationAction
            onClick={screenShare}
            label='ScreenShare'
            value='screenShare'
            icon={
              localUser !== undefined && localUser.isScreenShareActive() ? (
                <PictureInPictureIcon />
              ) : (
                <ScreenShareIcon />
              )
            }
          />
          <BottomNavigationAction
            onClick={selectCamera}
            label='SelectCamera'
            value='selectCamera'
            icon={<SwitchVideoIcon />}
          /> */}
          {/* <BottomNavigationAction
            onClick={handleToggleFullScreen}
            label='Fullscreen'
            value='fullscreen'
            icon={
              localUser !== undefined && fullscreen ? (
                <FullscreenExitIcon />
              ) : (
                <FullscreenIcon />
              )
            }
          /> */}
        </BottomNavigation>
      </Slide>
    </>
  );
}
