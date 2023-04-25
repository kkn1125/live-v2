import React, { MouseEvent, useState } from "react";
import { Paper } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

type ModalType = "normal" | "deleted" | "warned";

interface PopupModalType {
  immediately?: boolean;
  type?: ModalType;
  title?: string;
  contents?: string;
  children?: React.ReactElement | string;
  handler?: Function;
}

export default function PopupModal({
  children,
  immediately = false,
  type = "normal",
  title = "",
  contents = "",
  handler,
}: PopupModalType) {
  const [open, setOpen] = useState(immediately || false);

  const typeWords = {
    normal: {
      title: "안내",
      content: "안내 내용",
    },
    warned: {
      title: "경고",
      content: "경고 내용",
    },
    deleted: {
      title: "삭제된 영상",
      content: "삭제된 영상 URL 입니다.",
    },
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (e?: MouseEvent) => {
    setOpen(false);
  };

  const typeTitle = type === "normal" ? title : typeWords[type].title;
  const typeContent = type === "normal" ? contents : typeWords[type].content;

  return (
    <>
      {!immediately && (
        <Button variant='outlined' onClick={handleClickOpen}>
          {children}
        </Button>
      )}
      <Dialog
        open={open}
        onClose={(e) => {
          handleClose();
          handler?.(e);
        }}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'>
        <DialogTitle id='alert-dialog-title'>{typeTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            {typeContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {type === "normal" && (
            <Button
              onClick={(e) => {
                handleClose(e);
                handler?.(e, "close");
              }}>
              취소
            </Button>
          )}
          <Button
            onClick={(e) => {
              handleClose(e);
              handler?.(e, "confirm");
            }}
            autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
