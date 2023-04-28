import { Box, Typography, Stack, TextField, Button } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import LiveAddedLink from "./LiveAddedLink";

function LiveAddLink() {
  const linkDescRef = useRef<HTMLInputElement>();
  const linkRef = useRef<HTMLInputElement>();
  const socket = useContext(LiveSocketContext);
  const [roomLink, setRoomLink] = useState({
    link: "",
    desc: "",
  });

  useEffect(() => {
    socket.on(SIGNAL.ROOM, (type, origin, data) => {
      if (data.action === "send/link") {
        const desc = data.result.desc;
        const link = data.result.link;
        setRoomLink({
          link,
          desc,
        });
      }
    });
  }, []);

  function handleAddLink() {
    const linkDescEl = linkDescRef.current as HTMLInputElement;
    const linkEl = linkRef.current as HTMLInputElement;
    socket.sendBinary(SIGNAL.ROOM, "send/link", {
      link: linkEl.value,
      desc: linkDescEl.value,
    });
    linkEl.value = "";
    linkDescEl.value = "";
  }

  function handleAddLinkEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleAddLink();
    }
  }

  return (
    <Box sx={{ flex: 1 }}>
      <LiveAddedLink link={roomLink.link} desc={roomLink.desc} />
      <Typography fontSize={20} fontWeight={700}>
        🔗 링크 등록
      </Typography>
      <Stack gap={1}>
        <Box>
          <Typography fontSize={18} fontWeight={700}>
            팝업 내용
          </Typography>
          <TextField
            inputRef={linkDescRef}
            size='small'
            fullWidth
            sx={{
              flex: 1,
              ["& .MuiInputBase-root"]: {
                backgroundColor: "#56565656",
              },
              ["& input"]: {
                color: "#ffffff",
              },
            }}
            onKeyDown={handleAddLinkEnter}
          />
        </Box>

        <Box>
          <Typography fontSize={18} fontWeight={700}>
            리다이렉트 링크
          </Typography>
          <TextField
            inputRef={linkRef}
            size='small'
            fullWidth
            sx={{
              flex: 1,
              ["& .MuiInputBase-root"]: {
                backgroundColor: "#56565656",
              },
              ["& input"]: {
                color: "#ffffff",
              },
            }}
            onKeyDown={handleAddLinkEnter}
          />
        </Box>
        <Button variant='contained' color='success' onClick={handleAddLink}>
          등록
        </Button>
      </Stack>
    </Box>
  );
}

export default LiveAddLink;
