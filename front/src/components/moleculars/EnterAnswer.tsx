import { Box } from "@mui/material";
import React, { useState } from "react";
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
}: EnterAnswerType) {
  const [open, setOpen] = useState(false);
  const [id, setRoomId] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
    setRoomId(roomId || v4());
  };

  function handleClose() {
    setOpen(false);
  }
  return (
    <Box>
      <EnterButton onClick={handleClickOpen}>{answer[type]}</EnterButton>
      <EnterDialog
        type={type}
        open={open}
        handleClose={handleClose}
        title={title}
        content={content}
        to={to + (roomId ? "/" + id : "")}
        roomId={id}
      />
    </Box>
  );
}

export default EnterAnswer;
