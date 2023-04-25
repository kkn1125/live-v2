import { Box, keyframes, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BottomDrawer from "./BottomDrawer";

const sample = `🌸 [솔가] 최대 70% 할인 🌸`;

const FONT_SIZE = 18;

function SlideTitle({
  title = sample,
  size,
}: {
  title?: string;
  size: { width: number; height: number };
}) {
  const [show, setShow] = useState(false);
  const baseWidthRef = useRef<HTMLParagraphElement>(null);
  const responsiveWidthRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowTitle, setIsOverflowTitle] = useState(false);
  const infiniteSlide = keyframes`
    from { transform: translateX(0%); }
    to { transform: translateX(-100%); }
  `;

  function detectSameWidth() {
    if (baseWidthRef.current && responsiveWidthRef.current) {
      const baseWidth = baseWidthRef.current.clientWidth;
      const responsiveWidth = responsiveWidthRef.current.clientWidth;
      if (
        baseWidth > 0 &&
        responsiveWidth > 0 &&
        baseWidth !== responsiveWidth
      ) {
        // console.log(baseWidth);
        // console.log(responsiveWidth);
        // console.log("다름");
        setIsOverflowTitle(true);
      } else {
        // console.log("같음");
        setIsOverflowTitle(false);
      }
    }
  }

  if (baseWidthRef.current) {
    new ResizeObserver(detectSameWidth).observe(baseWidthRef.current);
  }

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event &&
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setShow(open);
    };

  useEffect(() => {
    detectSameWidth();
  }, []);

  return (
    <Box
      ref={baseWidthRef}
      sx={{
        // position: "absolute",
        // top: 0,
        zIndex: 10,
        py: 1,
        // backgroundColor: "#00000023",
        [`>#slide-text>.MuiTypography-root`]: {
          display: "inline-block",
          minWidth: size.width,
          whiteSpace: "nowrap",
          ...(isOverflowTitle && {
            animation: (theme) =>
              `${infiniteSlide} ${
                title.length * 2 > size.width
                  ? title.length * 150
                  : size.width * 20
              }ms linear infinite`,
          }),
        },
        maskImage: `linear-gradient(to left, transparent, black 32px), black calc(100% - 32px)), transparent ), transparent 100%), linear-gradient(black, black)`,
        maskRepeat: "no-repeat, no-repeat",
        maskSize: `calc(100% - 8px) 100%, 8px 100%`,
        maskPosition: "0 0, 100% 0",
        [".PrivateSwipeArea-root"]: {
          pointerEvents: "none",
        },
      }}>
      <BottomDrawer
        originRef={baseWidthRef}
        show={show}
        handleOpen={toggleDrawer}>
        <Box
          id='slide-text'
          component={"a"}
          href='#'
          sx={{
            color: "inherit",
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
          onClick={toggleDrawer(true)}>
          <Typography
            ref={responsiveWidthRef}
            fontSize={FONT_SIZE}
            sx={{ px: 2 }}>
            {title}
          </Typography>
          <Typography fontSize={FONT_SIZE} sx={{ px: 2 }}>
            {title}
          </Typography>
        </Box>
      </BottomDrawer>
    </Box>
  );
}

export default SlideTitle;
