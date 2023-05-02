import { Fade, Stack, Typography } from "@mui/material";
import React from "react";

export type ChatLineType = {
  nickname: string;
  content: string;
  createdAt: number;
};

function ChatLine({ chat }: { chat: ChatLineType }) {
  return (
    <Fade in timeout={1000}>
      <Typography>
        <Typography
          component='span'
          fontWeight={700}
          color={(theme) => theme.palette.grey[600]}>
          {chat.nickname}
        </Typography>
        {chat.content}
      </Typography>
    </Fade>
  );
}

export default ChatLine;
