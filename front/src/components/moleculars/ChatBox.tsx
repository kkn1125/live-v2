import { Box, Stack } from "@mui/material";
import React from "react";
import ChatLine, { ChatLineType } from "../atoms/ChatLine";

function ChatBox({ chatList }: { chatList: ChatLineType[] }) {
  return (
    <Stack>
      {chatList.map((chat) => (
        <ChatLine chat={chat} />
      ))}
    </Stack>
  );
}

export default ChatBox;
