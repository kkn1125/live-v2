import { Box, Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import ChatLine, { ChatLineType } from "../atoms/ChatLine";

const scrollWidth = 3;

function ChatBox({ chatList }: { chatList: ChatLineType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [chatList]);

  return (
    <Stack
      ref={scrollRef}
      sx={{
        maxHeight: 200,
        overflow: "auto",
        maskImage: "linear-gradient(transparent 0%, #000 50%)",
        ["&::-webkit-scrollbar"]: {
          // display: "none",
          width: scrollWidth,
          height: scrollWidth,
          backgroundColor: "#56565656",
        },
        ["&::-webkit-scrollbar-thumb"]: {
          // display: "none",
          width: scrollWidth,
          height: scrollWidth,
          backgroundColor: "#565656",
        },
      }}>
      {chatList.map((chat, i) => (
        <ChatLine key={i} chat={chat} />
      ))}

      {/* {chatList.map((chat) => (
      ))} */}
    </Stack>
  );
}

export default ChatBox;
