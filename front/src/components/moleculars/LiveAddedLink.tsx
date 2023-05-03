import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";

function LiveAddedLink() {
  const [room, setRoom] = useState<any>({});
  const [link, setLink] = useState("");
  const [desc, setDesc] = useState("");
  const socket = useContext(LiveSocketContext);

  useEffect(() => {
    socket.on(SIGNAL.ROOM, (type, origin, data) => {
      if (data.action === "find") {
        const room = data.result.room;
        if (room) {
          setRoom((room) => room);
          setLink((link) => room.link);
          setDesc((desc) => room.linkDesc);
        }
      } else if (data.action === "send/link") {
        setLink((link) => data.result.link);
        setDesc((desc) => data.result.desc);
      }
    });

    socket.sendBinary(SIGNAL.ROOM, "find", {
      roomId: room.id,
    });
  }, []);

  return link && desc ? (
    <Box
      component={Link}
      to={link}
      target='_blank'
      sx={{
        p: 1,
        borderRadius: 0.5,
        backgroundColor: "#ffffff56",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        textDecoration: "none",
        color: "#ffffff",
        // color: "#44ec7c",
      }}
      dangerouslySetInnerHTML={{
        __html: `<span>📢 [notice] ${desc}</span>`,
      }}
    />
  ) : (
    <></>
  );
}

export default LiveAddedLink;
