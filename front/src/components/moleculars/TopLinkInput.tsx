import { Box, Button, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";

type TopLinkInputType = {
  label: "link" | "message";
  prefix?: boolean;
};

function TopLinkInput({ label, prefix = false }: TopLinkInputType) {
  const [protocol, setProtocol] = useState(true);
  const linkRef = useRef<HTMLInputElement>();
  return (
    <Box>
      <Typography fontSize={20} fontWeight={700}>
        <Typography
          component='span'
          sx={{ textShadow: "0 0 999px #ffffff", color: "transparent" }}>
          ➕
        </Typography>
        {label}
      </Typography>
      <Box
        sx={{
          position: "relative",
        }}>
        {label === "link" && (
          <Button
            variant='text'
            sx={{
              textTransform: "lowercase",
              fontSize: 16,
              position: "absolute",
              top: "51%",
              color: "inherit",
              transform: "translateY(-50%)",
              zIndex: 1,
            }}
            onClick={() => setProtocol(!protocol)}>
            {protocol ? "http://" : "https://"}
          </Button>
        )}
        <TextField
          inputRef={linkRef}
          size='small'
          fullWidth
          sx={{
            ["& .MuiInputBase-root"]: {
              outline: "none",
              backgroundColor: "#ffffff56",
            },
            ["& input"]: {
              ...(prefix && { pl: protocol ? 7.5 : 8.5 }),
              color: "#ffffff",
              background: "#ffffff56",
              outline: "none",
            },
            [`input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active`]: {
              background: "#ffffff56",
              boxShadow: "0 0 0px 1000px #ffffff56 inset",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default TopLinkInput;
