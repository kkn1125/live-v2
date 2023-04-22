/* app options */
const APP_AUTHOR = import.meta.env.VITE_APP_AUTHOR;
const APP_BRAND_NAME = import.meta.env.VITE_APP_BRAND_NAME;
const APP_VERSION = import.meta.env.VITE_APP_VERSION;

/* front options */
const HOST = import.meta.env.VITE_HOST;
const PORT = import.meta.env.VITE_PORT;

/* socket options */
const SOCKET_PROTOCOL = import.meta.env.VITE_SOCKET_PROTOCOL;
const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
const SOCKET_PORT = import.meta.env.VITE_SOCKET_PORT;

/* media codecs */
const CODEC = "video/webm;codecs=vp9,opus";

/* live tools */
enum INTERCEPT {
  OPEN = "INTERCEPT/OPEN",
  CLOSE = "INTERCEPT/CLOSE",
  ERROR = "INTERCEPT/ERROR",
  MESSAGE = "INTERCEPT/MESSAGE",
  BINARY_MESSAGE = "INTERCEPT/BINARY_MESSAGE",
  NON_BINARY_MESSAGE = "INTERCEPT/NON_BINARY_MESSAGE",
}

enum SIGNAL {
  ROOM = "SIGNAL/ROOM",
  USER = "SIGNAL/USER",
  STREAM = "SIGNAL/STREAM",
  CHAT = "SIGNAL/CHAT",
}

/* context tools */
enum LIVE_SOCKET_ACTION {
  CONNECT = "LIVE_SOCKET/CONNECT",
  INITIALIZE = "LIVE_SOCKET/INITIALIZE",
  DISCONNECT = "LIVE_SOCKET/DISCONNECT",
}

type LiveSocketBasicActionType = "send" | "fetch";
type LiveSocketSpecialActionType = "create" | "delete" | "find";
type LiveSocketActionType =
  | LiveSocketBasicActionType
  | LiveSocketSpecialActionType;

type BasicLiveSocketEventType =
  | INTERCEPT.OPEN
  | INTERCEPT.CLOSE
  | INTERCEPT.ERROR
  | INTERCEPT.MESSAGE;

type SpecialLiveSocketEventType =
  | INTERCEPT.NON_BINARY_MESSAGE
  | INTERCEPT.BINARY_MESSAGE;

type DataLiveSocketEventType = SpecialLiveSocketEventType | SIGNAL;

type LiveSocketEventType =
  | BasicLiveSocketEventType
  | SpecialLiveSocketEventType
  | DataLiveSocketEventType;

type BasicLiveSocketEventListenerType = (
  type: string,
  message: MessageEvent<any>
) => void;
type DataLiveSocketEventListenerType = (
  type: string,
  message: MessageEvent<any>,
  data: Object
) => void;
type LiveSocketEventListenerType =
  | BasicLiveSocketEventListenerType
  | DataLiveSocketEventListenerType;

export {
  APP_AUTHOR,
  APP_BRAND_NAME,
  APP_VERSION,
  HOST,
  PORT,
  SOCKET_PROTOCOL,
  SOCKET_HOST,
  SOCKET_PORT,
  CODEC,
  INTERCEPT,
  SIGNAL,
  LIVE_SOCKET_ACTION,
};

export type {
  BasicLiveSocketEventType,
  SpecialLiveSocketEventType,
  DataLiveSocketEventType,
  LiveSocketEventType,
  //
  BasicLiveSocketEventListenerType,
  DataLiveSocketEventListenerType,
  LiveSocketEventListenerType,
  //
  LiveSocketBasicActionType,
  LiveSocketSpecialActionType,
  LiveSocketActionType,
};
