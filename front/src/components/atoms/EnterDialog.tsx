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
  roomTitle,
  roomId,
}: EnterDialogType) {
  const titleRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function sendRoomSettingData() {
    const data = {
      title: titleRef.current?.value,
      nickname: nicknameRef.current?.value,
    };

    if (!data.title) {
      alert("제목을 입력해주세요.");
      setTimeout(() => {
        titleRef.current?.focus();
      }, 10);
      return;
    }
    if (!data.nickname) {
      alert("닉네임을 입력해주세요.");
      setTimeout(() => {
        nicknameRef.current?.focus();
      }, 10);
      return;
    }

    if (data.title && data.nickname) {
      to &&
        navigate(to, {
          state: {
            roomId,
            ...data,
          },
        });
    }
    titleRef.current && (titleRef.current.value = "");
    nicknameRef.current && (nicknameRef.current.value = "");
  }

  function handleEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleClose();
      sendRoomSettingData();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  }

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
        <Typography
          fontSize={18}
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
          }}>
          room id
        </Typography>
        <TextField size='small' value={roomId} disabled={Boolean(roomId)} />
      </DialogContent>

      <DialogContent>
        <Typography
          fontSize={18}
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
          }}>
          title
        </Typography>
        <TextField
          inputRef={titleRef}
          {...(roomTitle && { value: roomTitle })}
          disabled={Boolean(roomTitle)}
          size='small'
          onKeyDown={handleEnter}
        />
      </DialogContent>
      <DialogContent>
        <Typography
          fontSize={18}
          fontWeight={700}
          sx={{
            textTransform: "uppercase",
          }}>
          nickname
        </Typography>
        <TextField
          inputRef={nicknameRef}
          size='small'
          onKeyDown={handleEnter}
        />
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
            sendRoomSettingData();
          }}
          autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
}
