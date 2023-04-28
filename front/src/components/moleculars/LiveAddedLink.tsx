import { Box, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

function LiveAddedLink({ link, desc }: { link: string; desc: string }) {
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
