import { Box, Stack } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import { LIVE_SOCKET_ACTION, SIGNAL } from "../../util/global";
import ChatButton from "../atoms/ChatButton";
import ChatInput from "../atoms/ChatInput";
import ChatBox from "../moleculars/ChatBox";

function Chat() {
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
  const [chatList, setChatList] = useState<
    {
      nickname: string;
      content: string;
      createdAt: number;
    }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on(SIGNAL.CHAT, (type, origin, data) => {
      const message = data.result;
      setChatList((chatList) => [...chatList, message]);
    });
  }, []);

  function handleSend() {
    if (inputRef.current) {
      if (!inputRef.current.value) return;
      const value = inputRef.current.value;

      // do something
      socket.sendBinary(SIGNAL.CHAT, "send", {
        nickname: "test",
        content: value,
      });

      inputRef.current.value = "";
    }
  }

  function handleEnterSend(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <Stack sx={{ width: 300 }}>
      <ChatBox chatList={chatList} />
      <Box
        sx={{
          position: "relative",
        }}>
        <ChatInput
          inputRef={inputRef}
          fullWidth
          sx={{
            ["& .MuiInputBase-root"]: {
              pr: 5,
            },
          }}
          onKeyDown={handleEnterSend}
        />
        <ChatButton handleSend={handleSend} />
      </Box>
    </Stack>
  );
}

export default Chat;
