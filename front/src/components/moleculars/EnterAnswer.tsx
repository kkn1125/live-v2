import { Box } from "@mui/material";
import React, { useState } from "react";
import EnterButton from "../atoms/EnterButton";
import EnterDialog from "../atoms/EnterDialog";

function EnterAnswer({ title, content, to }: EnterAnswerType) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  function handleClose() {
    setOpen(false);
  }
  return (
    <Box>
      <EnterButton onClick={handleClickOpen}>test</EnterButton>
      <EnterDialog
        open={open}
        handleClose={handleClose}
        title={title}
        content={content}
        to={to}
      />
    </Box>
  );
}

export default EnterAnswer;
