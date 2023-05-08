import { Stack, TextField } from "@mui/material";
import React, { useContext, useRef } from "react";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import Chattings from "./Chattings";

function StreamerChatInput({ user }: { user: any }) {
  const socket = useContext(LiveSocketContext);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    if (inputRef.current) {
      if (!inputRef.current.value) return;
      const value = inputRef.current.value;
      // do something
      socket.sendBinary(SIGNAL.CHAT, "send", {
        nickname: user.nickname,
        content: value,
        createdAt: +new Date(),
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
    <Stack>
      <TextField
        inputRef={inputRef}
        onKeyDown={handleEnterSend}
        size='small'
        fullWidth
        autoFocus
        sx={{
          ["& .MuiInputBase-root"]: {
            backgroundColor: "#ffffff56",
          },
        }}
      />
      <Stack
        direction='column-reverse'
        sx={{
          height: "100vh",
          maxHeight: 200,
          maskImage: "linear-gradient(transparent 0%, #000 50%)",
        }}>
        <Chattings user={user} />
      </Stack>
    </Stack>
  );
}

export default StreamerChatInput;
