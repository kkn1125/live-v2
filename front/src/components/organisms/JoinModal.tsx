import { Box, Button, Paper, Slide, Stack, Typography } from "@mui/material";
import React from "react";

function JoinModal() {
  return (
    <Slide in timeout={1000}>
      <Paper elevation={5} sx={{ p: 3 }}>
        <Typography>test</Typography>
        <Stack direction='row' justifyContent='space-between'>
          <Button>취소</Button>
          <Button>확인</Button>
        </Stack>
      </Paper>
    </Slide>
  );
}

export default JoinModal;
