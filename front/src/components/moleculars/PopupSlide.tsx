import { Box, IconButton, keyframes, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const keyframeLeft = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0%);
    opacity: 1;
  }
`;

const keyframeRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0%);
  opacity: 1;
  }
`;

function PopupSlide({
  children,
  links = [],
}: {
  children?: React.ReactElement | React.ReactElement[];
  links?: any[];
}): JSX.Element {
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<any>({});
  const [change, setChange] = useState(true);
  const [direction, setDirection] = useState("left");

  useEffect(() => {
    setIndex((index) => 0);
    setCurrent((current) => links[index]);
  }, [links]);

  const handleDownIndex = () => {
    setDirection("left");
    setChange(false);
    setTimeout(() => {
      if (index > 0) {
        const idx = index - 1;
        setIndex((index) => idx);
        setCurrent((current) => links[idx]);
      } else {
        const idx = links.length - 1;
        setIndex((index) => idx);
        setCurrent((current) => links[idx]);
      }
      setChange(true);
    }, 100);
  };

  const handleUpIndex = () => {
    setDirection("right");
    setChange(false);
    setTimeout(() => {
      if (index < links.length - 1) {
        const idx = index + 1;
        setIndex((index) => idx);
        setCurrent((current) => links[idx]);
      } else {
        const idx = 0;
        setIndex((index) => idx);
        setCurrent((current) => links[idx]);
      }
      setChange(true);
    }, 100);
  };

  return (
    <Stack
      direction='row'
      gap={1}
      alignItems='center'
      sx={{
        width: "100%",
      }}>
      {links.length > 0 ? (
        <>
          <IconButton
            color='error'
            size='small'
            sx={{ width: 30, height: 30 }}
            onClick={handleDownIndex}>
            &lt;
          </IconButton>
          <Stack
            direction='row'
            gap={3}
            sx={{
              overflow: "hidden",
              minHeight: 38,
              width: "100%",
            }}>
            {current && change && (
              <Box
                component={Link}
                to={current.link}
                target='_blank'
                sx={{
                  p: 1,
                  borderRadius: 0.5,
                  backgroundColor: "#ffffff56",
                  flexDirection: "row",
                  alignItems: "center",
                  textDecoration: "none",
                  width: "100%",
                  color: "#ffffff",
                  // color: "#44ec7c",
                  animation: `${
                    direction === "left" ? keyframeLeft : keyframeRight
                  } 150ms ease-in-out both`,
                }}
                dangerouslySetInnerHTML={{
                  __html: `<span>📢 [notice] ${current.desc}</span>`,
                }}
              />
            )}
          </Stack>
          <IconButton
            color='error'
            size='small'
            sx={{ width: 30, height: 30 }}
            onClick={handleUpIndex}>
            &gt;
          </IconButton>
        </>
      ) : (
        <></>
      )}
    </Stack>
  );
}

export default PopupSlide;
