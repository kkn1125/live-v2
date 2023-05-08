import { Fade, Stack, Typography } from "@mui/material";

export type ChatLineType = {
  nickname: string;
  content: string;
  createdAt: number;
};

function ChatLine({ chat }: { chat: ChatLineType }) {
  return (
    <Fade in timeout={1000}>
      <Stack direction='row' gap={1}>
        <Typography
          component='span'
          fontWeight={700}
          color={(theme) => theme.palette.grey[600]}>
          {chat.nickname}
        </Typography>
        <Typography sx={{ color: "inherit", wordBreak: "break-all" }}>
          {chat.content}
        </Typography>
      </Stack>
    </Fade>
  );
}

export default ChatLine;
