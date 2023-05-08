import { Box, Button, Stack } from "@mui/material";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";

function PopupList({ links = [] }: { links: any[] }) {
  const socket = useContext(LiveSocketContext);

  const handleRemoveLink = (link: string, desc: string) => {
    if (confirm(`삭제하시겠습니까?\nLink: ${link}\nDesc: ${desc}\n`)) {
      socket.sendBinary(SIGNAL.ROOM, "delete/link", {
        link,
        desc,
      });
    } else {
    }
  };

  return (
    <Stack gap={1}>
      {links.map((link, i) => (
        <Stack key={i} direction='row' gap={1}>
          <Box
            to={link.link}
            component={Link}
            target='_blank'
            sx={{
              p: 1,
              flex: 1,
              borderRadius: 0.5,
              backgroundColor: "#ffffff56",
              flexDirection: "row",
              alignItems: "center",
              textDecoration: "none",
              color: "#ffffff",
            }}
            dangerouslySetInnerHTML={{
              __html: `<span>📢 [notice] ${link.desc}</span>`,
            }}
          />
          <Button
            onClick={() => handleRemoveLink(link.link, link.desc)}
            color='error'
            variant='contained'
            sx={{ minWidth: "auto", width: 50 }}>
            &times;
          </Button>
        </Stack>
      ))}
    </Stack>
  );
}

export default PopupList;
