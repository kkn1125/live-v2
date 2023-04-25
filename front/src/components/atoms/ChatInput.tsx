import { styled, TextField } from "@mui/material";
import React from "react";

const ChatInput = styled(TextField)`
  & .MuiInputBase-root {
    background-color: #ffffff;
  }
`;

export default ChatInput;
