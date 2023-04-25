import React, {
  useRef,
  useEffect,
  useState,
  MouseEvent,
  memo,
  useMemo,
  useCallback,
  Fragment,
  useContext,
} from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  Paper,
  Fade,
  IconButton,
  Badge,
  styled,
  Avatar,
  TextField,
} from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import FavoriteIcon from "@mui/icons-material/Favorite";
import anime from "animejs";
import ChatIcon from "@mui/icons-material/Chat";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import LiveSocket from "../../model/LiveSocket";
import { SIGNAL } from "../../util/global";
import {
  LiveSocketContext,
  LiveSocketDispatchContext,
} from "../../context/LiveSocketProvider";
import { useLocation } from "react-router-dom";

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

const randomUserName = [
  "몰디브두잔",
  "호박고구마",
  "고슴도치",
  "집게리아사장",
  "레이첼",
  "뜬구름",
  "죠형",
  "마름모",
  "쭈니",
  "코카사이다",
];
const randomMessage = [
  "진행이 너무 깔끔하네요!",
  "화이트는 기본이니까",
  "맞아요 순수!",
  "룩에 맞춰서 골라 쓰기 좋지요",
  "진짜 어떤 옷에도 깔끔하게 잘 어울릴 것 같아요",
  "색이 너무 이뻐요",
  "다른 컬러도 착용해주세요!",
  "지금까지는 화사한 느낌이었다면 블랙은 시크한 느낌",
  "좋아요!",
  "이벤트 참여는 어떻게 하는거죠?",
  "꾸미기 귀찮아하는 남성들에게 딱이겠네요",
  "저희 남편한테 하나 사줘야 겠어요",
  "데일리로 착용하기 간편한 제품!",
];

function Chattings({
  // videoEL,
  nosidebar = false,
}: // room,
// user,
// socket,
// size,
// toggleChat,
// toggleChatting,
{
  // videoEL: HTMLIFrameElement | HTMLVideoElement;
  nosidebar?: boolean;
  // room: any;
  // user: any;
  // socket: LiveSocket;
  // size: { width: number; height: number };
  // toggleChat: boolean;
  // toggleChatting: Function;
}) {
  const socket = useContext(LiveSocketContext);
  const socketDispatch = useContext(LiveSocketDispatchContext);
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
  // const [chatContent, setChatContent] = useState("");
  // const inputRef = useRef<HTMLInputElement>();
  const [toggleChat, setToggleChat] = useState(false);

  function autoDummyChat() {
    setChattings((chattings) => [
      ...chattings,
      {
        nickname:
          randomUserName[Math.floor(Math.random() * randomUserName.length)],
        content:
          randomMessage[Math.floor(Math.random() * randomMessage.length)],
        createdAt: Date.now(),
      },
    ]);
    // setTimeout(() => {
    //   autoDummyChat();
    // }, Math.random() * 5000);
  }

  const offArticleEffect = () => {
    setArticleActive(false);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      left: 0,
    });
  }, [chattings]);

  useEffect(() => {
    // autoDummyChat();
    socket?.on(SIGNAL.CHAT, (type, origin, data) => {
      setChattings((chattings) => [
        ...chattings,
        {
          nickname: data.result.nickname,
          content: data.result.message,
          createdAt: Date.now(),
        },
      ]);
    });
  }, []);

  const handleClickHeart = (e: MouseEvent) => {
    setHeart(true);
    if (!articleActive) {
      setArticleActive(true);
    }
  };

  useEffect(() => {
    socket.on(SIGNAL.CHAT, (type, origin, data) => {
      const message = data.result;
      setChatList((chatList) => [...chatList, message]);
    });
  }, []);

  function handleSend() {
    if (inputRef.current) {
      if (!inputRef.current.value) return;
      const value = inputRef.current.value;

      // do something
      socket.sendBinary(SIGNAL.CHAT, "send", {
        nickname: locate.state.nickname,
        content: value,
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
          }}
          onClick={() => {
            /* autoDummyChat() */
          }}>
          {chatList.map(({ nickname, content, createdAt }, i) => (
            <Fade key={i} in timeout={1000}>
              <Typography>
                <Typography
                  component='span'
                  fontWeight={700}
                  color={(theme) => theme.palette.grey[600]}>
                  {nickname}
                </Typography>{" "}
                {content}
                {/* |{" "}
              {new Date(createdAt).toLocaleString("ko")} */}
              </Typography>
            </Fade>
          ))}
          {/* <Button onClick={autoDummyChat}>random chat</Button> */}
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
                src='/static/images/avatar/1.jpg'
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
