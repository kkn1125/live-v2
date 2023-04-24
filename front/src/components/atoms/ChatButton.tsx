import { Box, Button, IconButton } from "@mui/material";
import React from "react";
import SendIcon from "@mui/icons-material/Send";

function ChatButton({ handleSend }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
      }}>
      <IconButton onClick={handleSend}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default ChatButton;
