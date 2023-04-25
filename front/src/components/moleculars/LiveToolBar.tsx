import { Box, IconButton, Menu, MenuItem, Stack } from "@mui/material";
import React, { useRef, useState, MouseEvent } from "react";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import PopupModal from "./PopupModal";
import { Link, useNavigate } from "react-router-dom";

const menuId = "top-menu";

const RouteImage = ({ children }: { children: React.ReactElement }) => {
  return <Link to='/'>{children}</Link>;
};

function LiveToolBar() {
  const [sound, setSound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorMenuEl);
  const navigate = useNavigate();

  const handleSound = () => {
    setSound(!sound);
  };

  const handleClose = () => {
    setShowModal(true);
  };

  const handlePopup = (e: Event, type: string) => {
    setShowModal(false);
    if (type === "confirm") {
      navigate("/");
    }
  };

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorMenuEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent={"space-between"}
      sx={{
        zIndex: 1000,
        pt: 1,
        px: 1,
      }}>
      <RouteImage>
        <Box
          component='img'
          src='/images/ander_white.png'
          width='auto'
          height={25}
          sx={{
            aspectRatio: "13/3",
          }}
        />
      </RouteImage>
      <Box>
        <IconButton color='inherit' onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <IconButton color='inherit' onClick={handleSound}>
          {sound ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
        <IconButton color='inherit' onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      {showModal && (
        <PopupModal
          title='다른 영상 보기'
          contents='테스트'
          type='normal'
          immediately
          handler={handlePopup}
        />
      )}
      <Menu
        anchorEl={anchorMenuEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isMenuOpen}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>page1</MenuItem>
        <MenuItem onClick={handleMenuClose}>page2</MenuItem>
      </Menu>
    </Stack>
  );
}

export default LiveToolBar;
