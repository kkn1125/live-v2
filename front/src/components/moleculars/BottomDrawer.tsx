import React, { Fragment, useState } from "react";

import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

function BottomDrawer({
  children,
  originRef,
  show,
  handleOpen,
  window,
}: {
  children: React.ReactElement;
  originRef: React.RefObject<HTMLParagraphElement | undefined>;
  show: boolean;
  handleOpen: Function;
  window?: () => Window;
}) {
  return (
    <Fragment>
      {children}
      <SwipeableDrawer
        anchor={"bottom"}
        open={show}
        onClose={handleOpen(false)}
        onOpen={handleOpen(true)}
        >
        <Box
          role='presentation'
          onClick={handleOpen(false)}
          onKeyDown={handleOpen(false)}>
          <List>
            {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </Fragment>
  );
}

export default BottomDrawer;
