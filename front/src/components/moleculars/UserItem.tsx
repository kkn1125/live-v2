import PersonIcon from "@mui/icons-material/Person";
import StarsIcon from "@mui/icons-material/Stars";
import { Button, Chip, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { LiveSocketContext } from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";

function UserItem({ user = {} }: { user: any }) {
  const socket = useContext(LiveSocketContext);

  function handleRemoveUser() {
    if (
      confirm(`해당 유저를 강제 퇴장 시키겠습니까?\n사용자 닉네임: ${user.id}`)
    ) {
      socket.sendBinary(SIGNAL.ROOM, "out/target", {
        roomId: user.involveRoomId,
        userId: user.id,
      });
    }
  }

  return (
    <Stack direction='row' gap={1} alignItems='center' title={user.id}>
      {user.role === "admin" ? <StarsIcon /> : <PersonIcon />}
      <Typography>{user.nickname}</Typography>
      {user.role === "admin" ? (
        <Chip size='small' label='admin' color='primary' />
      ) : (
        <Button
          size='small'
          variant='contained'
          color='error'
          onClick={handleRemoveUser}>
          추방
        </Button>
      )}
    </Stack>
  );
}

export default UserItem;
