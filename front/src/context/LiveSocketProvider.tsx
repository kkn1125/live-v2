import { createContext, Dispatch, useReducer } from "react";
import LiveSocket from "../model/LiveSocket";
import {
  LIVE_SOCKET_ACTION,
  SOCKET_HOST,
  SOCKET_PORT,
  SOCKET_PROTOCOL,
} from "../util/global";

let initialState = new LiveSocket(SOCKET_PROTOCOL, SOCKET_HOST, SOCKET_PORT);

export const LiveSocketContext = createContext<LiveSocket>(initialState);
export const LiveSocketDispatchContext = createContext<
  Dispatch<{
    type: LIVE_SOCKET_ACTION;
    [k: string]: any;
  }>
>(() => {});

const reducer = (state: LiveSocket, action: any) => {
  switch (action.type) {
    case LIVE_SOCKET_ACTION.CONNECT:
      state.connect(action.queries);
      return state;
    case LIVE_SOCKET_ACTION.INITIALIZE:
      state.initialize();
      return state;
    case LIVE_SOCKET_ACTION.JOIN:
      state.rooms.join(action.roomId);
      return state;
    case LIVE_SOCKET_ACTION.OUT:
      state.rooms.out(action.roomId);
      return state;
    case LIVE_SOCKET_ACTION.DELETE_ROOM:
      state.rooms.delete(action.roomId);
      return state;
    case LIVE_SOCKET_ACTION.DISCONNECT:
      state.disconnect();
      state.socket = null;
      return state;
    default:
      return state;
  }
};

const LiveSocketProvider = ({
  children,
}: {
  children: React.ReactElement | React.ReactElement[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <LiveSocketDispatchContext.Provider value={dispatch}>
      <LiveSocketContext.Provider value={state}>
        {children}
      </LiveSocketContext.Provider>
    </LiveSocketDispatchContext.Provider>
  );
};

export default LiveSocketProvider;
