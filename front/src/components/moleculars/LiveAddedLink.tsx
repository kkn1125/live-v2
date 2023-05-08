import { useContext, useEffect, useState } from "react";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import PopupList from "./PopupList";
import PopupSlide from "./PopupSlide";

function LiveAddedLink({ admin = false }: { admin?: boolean }) {
  const [room, setRoom] = useState<any>({});
  const [links, setLinks] = useState<any>([]);
  const socket = useContext(LiveSocketContext);

  useEffect(() => {
    socket.on(SIGNAL.ROOM, (type, origin, data) => {
      if (data.action === "find") {
        const room = data.result.room;
        if (room) {
          setRoom(() => room);
          setLinks((link) => room.links);
        }
      } else if (data.action === "send/link") {
        const room = data.result.room;
        setLinks((link) => room.links);
      } else if (data.action === "delete/link") {
        const room = data.result.room;
        setRoom(() => room);
        setLinks((link) => room.links);
      }
    });

    socket.sendBinary(SIGNAL.ROOM, "find", {
      roomId: room.id,
    });
  }, []);

  return admin ? <PopupList links={links} /> : <PopupSlide links={links} />;
  // {/* {links.map((link, i) => (
  //   <Box
  //     key={i}
  //     component={Link}
  //     to={link.link}
  //     target='_blank'
  //     sx={{
  //       p: 1,
  //       borderRadius: 0.5,
  //       backgroundColor: "#ffffff56",
  //       display: "flex",
  //       flexDirection: "row",
  //       alignItems: "center",
  //       textDecoration: "none",
  //       color: "#ffffff",
  //       // color: "#44ec7c",
  //     }}
  //     dangerouslySetInnerHTML={{
  //       __html: `<span>📢 [notice] ${link.desc}</span>`,
  //     }}
  //   />
  // ))} */}
}

export default LiveAddedLink;
