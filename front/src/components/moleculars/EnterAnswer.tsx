import { Box } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import { answer } from "../../util/global";
import EnterButton from "../atoms/EnterButton";
import EnterDialog from "../atoms/EnterDialog";

function EnterAnswer({
  type = "enter",
  title,
  content,
  to,
  roomId = "",
  roomTitle = "",
  color,
  variant,
  children,
}: EnterAnswerType) {
  const [open, setOpen] = useState(false);
  const [id, setRoomId] = useState("");
  const [customRoomTitle, setRoomTitle] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
    setRoomId(roomId || v4());
    setRoomTitle(roomTitle);
  };

  function handleClose() {
    setOpen(false);
  }
  return (
    <Box sx={{ flex: 1 }}>
      {children ? (
        <Box
          onClick={handleClickOpen}
          sx={{
            cursor: "pointer",
          }}>
          {children}
        </Box>
      ) : (
        <EnterButton onClick={handleClickOpen} color={color} variant={variant}>
          {answer[type]}
        </EnterButton>
      )}
      <EnterDialog
        type={type}
        open={open}
        handleClose={handleClose}
        title={title}
        content={content}
        to={to + (roomId ? "/" + id : "")}
        roomId={id}
        roomTitle={customRoomTitle}
      />
    </Box>
  );
}

export default EnterAnswer;
