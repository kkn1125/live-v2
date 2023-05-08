import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { Avatar, Box, IconButton, Stack } from "@mui/material";
import anime from "animejs";
import React, { Fragment, memo, useEffect } from "react";

const opacities = Object.fromEntries(
  new Array(15).fill(0).map((a, i) => [i, (Math.random() + 0.2) * 0.8])
);

const Articles = memo(
  ({ offArticleEffect }: { offArticleEffect: Function }) => {
    useEffect(() => {
      anime({
        targets: ".article",
        translateX: function (el: { getAttribute: (arg0: string) => any }) {
          return el.getAttribute("data-x") + Math.random() * 20 - 20;
        },
        translateY: function (el: any, i: number) {
          return 50 + -50 * i * 0.2 - 50;
        },
        scale: function (el: any, i: number, l: number) {
          return l - 15 - i * 0.1;
        },
        rotate: function () {
          return anime.random(-180, 180);
        },
        borderRadius: function () {
          return ["50%", anime.random(10, 35) + "%"];
        },
        duration: function () {
          return anime.random(1200, 1800);
        },
        delay: function () {
          return anime.random(0, 400);
        },
        direction: "alternate",
        complete(anim) {
          offArticleEffect();
        },
      });
    }, []);

    const heartArticles = new Array(15).fill(0).map((a, i) => {
      return (
        <Box
          key={i}
          data-x={/* i % 2 === 0 ? 90 : i * 45 */ 0}
          className='article'
          sx={{
            display: "inline-block",
            width: 30,
            height: 30,
            position: "absolute",
            pointerEvents: "none",
            zIndex: 100,
          }}>
          <FavoriteIcon
            color='error'
            sx={{
              opacity: opacities[i],
            }}
          />
        </Box>
      );
    });

    return <Fragment>{heartArticles}</Fragment>;
  }
);

function ChatSideBar({
  inputRef,
  show = false,
  heart,
  articleActive,
  setArticleActive,
  handleClickHeart,
  toggleChatting,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  show?: boolean;
  heart: boolean;
  articleActive: boolean;
  setArticleActive: React.Dispatch<React.SetStateAction<boolean>>;
  handleClickHeart: (e: React.MouseEvent) => void;
  toggleChatting: () => void;
}) {
  const offArticleEffect = () => {
    setArticleActive(false);
  };

  return show ? (
    <Stack justifyContent={"space-between"}>
      <IconButton color='inherit'>
        <Box
          sx={{
            position: "relative",
            ["&::before"]: {
              content: '"➕"',
              color: "transparent",
              textShadow: "0 0 0 #ffffff",
              fontSize: 12,
              borderRadius: "50%",
              p: 0.3,
              backgroundColor: "#ff0000",
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            },
          }}>
          <Avatar
            alt='Remy Sharp'
            sx={{
              width: 50,
              height: 50,
            }}
          />
        </Box>
      </IconButton>
      <IconButton
        color='inherit'
        size='large'
        onClick={handleClickHeart}
        sx={{
          position: "relative",
        }}>
        <Box
          className='articles'
          sx={{
            position: "absolute",
            top: "28%",
            left: "28%",
          }}>
          {articleActive && <Articles offArticleEffect={offArticleEffect} />}
        </Box>
        <FavoriteIcon
          fontSize='large'
          color={heart ? "error" : "inherit"}
          sx={{ zIndex: 5 }}
        />
      </IconButton>
      <IconButton color='inherit' size='large'>
        <HelpCenterIcon fontSize='large' />
      </IconButton>
      <IconButton
        color='inherit'
        size='large'
        onClick={() => {
          toggleChatting();
          setTimeout(() => {
            inputRef.current?.focus();
          }, 1);
        }}>
        <ChatIcon fontSize='large' />
      </IconButton>
    </Stack>
  ) : (
    <></>
  );
}

export default ChatSideBar;
