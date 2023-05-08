import { Box } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import ChatLine from "../atoms/ChatLine";

function Chattings({ user }: { user?: any }) {
  const socket = useContext(LiveSocketContext);
  const locate = useLocation();
  const [chatList, setChatList] = useState<
    {
      nickname: string;
      content: string;
      createdAt: number;
    }[]
  >([]);
  const chatRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
    }
  }, [chatList]);

  useEffect(() => {
    socket.on(SIGNAL.CHAT, (type, origin, data) => {
      if (data.action === "send") {
        setChatList((chattings) => [
          ...chattings,
          {
            nickname: data.result.nickname,
            content: data.result.content,
            createdAt: Date.now(),
          },
        ]);
      }
    });
  }, []);

  return (
    <Box
      ref={chatRef}
      sx={{
        backgroundColor: "transparent",
        color: "inherit",
        overflow: "auto",
        userSelect: "none",
        maxHeight: 300,
        bottom: (theme) => theme.typography.pxToRem(45),
        [`&::-webkit-scrollbar`]: {
          display: "none",
        },
        [`.MuiTypography-root`]: {
          fontSize: (theme) => theme.typography.pxToRem(14),
        },
      }}>
      {chatList.map(({ nickname, content, createdAt }, i) => (
        <ChatLine key={i} chat={{ nickname, content, createdAt }} />
      ))}
    </Box>
  );
}

export default Chattings;
