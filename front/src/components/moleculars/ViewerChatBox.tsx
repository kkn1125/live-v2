import { Fade, Stack, TextField } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import ChatSideBar from "./ChatSideBar";
import Chattings from "./Chattings";

function ViewerChatBox({ user }: { user: any }) {
  const socket = useContext(LiveSocketContext);
  const [toggleChat, setToggleChat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [heart, setHeart] = useState(false);
  const [articleActive, setArticleActive] = useState(false);

  const handleClickHeart = (e: React.MouseEvent) => {
    setHeart(true);
    if (!articleActive) {
      setArticleActive(true);
      handleAddLikes();
    }
  };

  function toggleChatting() {
    setToggleChat(!toggleChat);
  }

  function handleAddLikes() {
    socket.sendBinary(SIGNAL.ROOM, "like");
  }

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
    <Stack
      direction='row'
      sx={{
        textAlign: "left",
        width: "inherit",
        px: 2,
        pointerEvents: "initial",
        alignItems: "stretch",
        maxHeight: 250,
      }}>
      <Stack
        justifyContent='flex-end'
        sx={{
          flex: 1,
          height: "100vh",
          maxHeight: "inherit",
          maskImage: "linear-gradient(transparent 0%, #000 50%)",
        }}>
        <Chattings user={user} />
        {toggleChat && (
          <Fade in timeout={500}>
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
          </Fade>
        )}
      </Stack>
      <ChatSideBar
        show
        inputRef={inputRef}
        heart={heart}
        articleActive={articleActive}
        setArticleActive={setArticleActive}
        handleClickHeart={handleClickHeart}
        toggleChatting={toggleChatting}
      />
    </Stack>
  );
}

export default ViewerChatBox;
