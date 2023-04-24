import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "react-router-dom";
import { Stack, TextField, Typography } from "@mui/material";
import { v4 } from "uuid";

export default function EnterDialog({
  type,
  open,
  handleClose,
  title,
  content,
  to,
  roomId,
}: EnterDialogType) {
  const nicknameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose();
      }}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'>
      <DialogTitle id='alert-dialog-title'>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogContent>
        <Stack>
          <Typography
            fontSize={18}
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
            }}>
            room id
          </Typography>
          <TextField size='small' value={roomId} disabled />
        </Stack>
      </DialogContent>
      <DialogContent>
        <Stack>
          <Typography
            fontSize={18}
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
            }}>
            nickname
          </Typography>
          <TextField inputRef={nicknameRef} size='small' />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
          }}>
          취소
        </Button>
        <Button
          onClick={() => {
            handleClose();
            if (nicknameRef.current) {
              const value = nicknameRef.current.value;
              if (value) {
                to &&
                  navigate(to, {
                    state: {
                      roomId,
                      nickname: value,
                    },
                  });
                nicknameRef.current.value = "";
              }
            }
          }}
          autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
