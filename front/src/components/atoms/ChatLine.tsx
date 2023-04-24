import { Stack, Typography } from "@mui/material";
import React from "react";

export type ChatLineType = { nickname: string; content: string; createdAt: number };

function ChatLine({ chat }: { chat: ChatLineType }) {
  return (
    <Stack direction='row'>
      <Typography>{chat.nickname}</Typography>
    </Stack>
  );
}

export default ChatLine;
