import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import { Avatar, Box, Fade, IconButton, Stack, TextField } from "@mui/material";
import anime from "animejs";
import React, {
  Fragment,
  memo,
  MouseEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import { SIGNAL } from "../../util/global";
import ChatLine from "../atoms/ChatLine";

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

function Chattings({
  user,
  nosidebar = false,
}: {
  user?: any;
  userNickname?: string;
  nosidebar?: boolean;
}) {
  const socket = useContext(LiveSocketContext);
  const locate = useLocation();
  const [chatList, setChatList] = useState<
    {
      nickname: string;
      content: string;
      createdAt: number;
    }[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chattings, setChattings] = useState<
    { nickname: string; content: string; createdAt: number }[]
  >([]);
  const [heart, setHeart] = useState(false);
  const [articleActive, setArticleActive] = useState(false);
  const chatRef = useRef<HTMLDivElement>();
  const [toggleChat, setToggleChat] = useState(false);

  const offArticleEffect = () => {
    setArticleActive(false);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      left: 0,
    });
  }, [chattings]);

  const handleClickHeart = (e: MouseEvent) => {
    setHeart(true);
    if (!articleActive) {
      setArticleActive(true);
      handleAddLikes();
    }
  };

  useEffect(() => {
    socket.on(SIGNAL.CHAT, (type, origin, data) => {
      if (data.action === "send") {
        setChatList((chattings) => [
          ...chattings,
          {
            nickname: data.result.nickname,
            content: data.result.content,
            createdAt: Date.now(),
          },
        ]);
      }
    });
  }, []);

  function handleSend() {
    if (inputRef.current) {
      if (!inputRef.current.value) return;
      const value = inputRef.current.value;
      // do something
      console.log(user.nickname, user, value);
      socket.sendBinary(SIGNAL.CHAT, "send", {
        nickname: user.nickname,
        content: value,
        createdAt: +new Date(),
      });

      inputRef.current.value = "";
    }
  }

  function toggleChatting() {
    setToggleChat(!toggleChat);
  }

  function handleEnterSend(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  function handleAddLikes() {
    socket.sendBinary(SIGNAL.ROOM, "like");
  }

  return (
    <Stack
      direction='row'
      sx={{
        textAlign: "left",
        width: "inherit",
        px: 2,
        pointerEvents: "initial",
        alignItems: "stretch",
        ...(!nosidebar && {
          maxHeight: 250,
        }),
      }}>
      <Stack
        justifyContent='flex-end'
        sx={{
          flex: 1,
          height: "100vh",
          maxHeight: "inherit",
          ...(!nosidebar && {
            maskImage: "linear-gradient(transparent 0%, #000 50%)",
          }),
        }}>
        <Box
          ref={chatRef}
          sx={{
            backgroundColor: "transparent",
            color: "inherit",
            overflow: "auto",
            userSelect: "none",
            ...(nosidebar && {
              height: 300,
            }),
            bottom: (theme) => theme.typography.pxToRem(45),
            [`&::-webkit-scrollbar`]: {
              display: "none",
            },
            [`.MuiTypography-root`]: {
              fontSize: (theme) => theme.typography.pxToRem(14),
            },
          }}>
          {chatList.map(({ nickname, content, createdAt }, i) => (
            <ChatLine key={i} chat={{ nickname, content, createdAt }} />
          ))}
        </Box>
        {(nosidebar || toggleChat) && (
          <Fade in timeout={500}>
            <TextField
              inputRef={inputRef}
              onKeyDown={handleEnterSend}
              size='small'
              fullWidth
              autoFocus
              sx={{
                ["& .MuiInputBase-root"]: {
                  backgroundColor: "#ffffff56",
                },
              }}
            />
          </Fade>
        )}
      </Stack>
      {!nosidebar && (
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
              {articleActive && (
                <Articles offArticleEffect={offArticleEffect} />
              )}
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
      )}
    </Stack>
  );
}

export default Chattings;
