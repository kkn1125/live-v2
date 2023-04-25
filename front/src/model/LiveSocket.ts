import protobufjs from "protobufjs";
import type {
  BasicLiveSocketEventListenerType,
  BasicLiveSocketEventType,
  DataLiveSocketEventListenerType,
  DataLiveSocketEventType,
  DataType,
  LiveSocketActionType,
  LiveSocketBasicActionType,
  LiveSocketEventType,
  LiveSocketSpecialActionType,
} from "../util/global";
import { INTERCEPT, SIGNAL } from "../util/global";
import User from "./User";

const { Field, Message } = protobufjs;

const fields = [
  "id",
  "type",
  "action",
  "data",
  "file",
  "result",
  "client",
  "server",
];

for (let index in fields) {
  if (fields[index] in (Message.$type?.fields || {})) continue;
  switch (fields[index]) {
    case "id":
      Field.d(
        Number(index),
        "float",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    case "type":
    case "action":
    case "data":
    case "file":
    case "result":
      Field.d(
        Number(index),
        "string",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    case "client":
    case "server":
      Field.d(
        Number(index),
        "bool",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    default:
      break;
  }
}

export default class LiveSocket {
  static log(...args: any[]) {
    console.log(`🚀 LIVE LOG:`, ...args);
  }

  stateOpen: boolean = false;

  activatePromise() {
    return new Promise((resolve) => {
      this.isActivate = resolve;
      if (this.stateOpen) {
        this.isActivate(true);
      }
    });
  }
  isActivate: (value: any) => void = () => {};

  protocol: string;
  host: string;
  port: number;
  queries: Object;

  user?: User;

  socket: WebSocket | null = null;
  events: {
    [key: string]: {
      promise: ((value: any) => void)[];
      listeners:
        | BasicLiveSocketEventListenerType[]
        | DataLiveSocketEventListenerType[];
    };
  } = {};

  constructor(protocol?: "wss" | "ws", host?: string, port?: number) {
    /* 기본 값 세팅 */
    protocol && (this.protocol = protocol);
    host && (this.host = host);
    port && (this.port = port);
  }

  connect(queries: Object = {}) {
    /* 기본 값 없으면 새로 받아서 다시 설정 */
    // !this.protocol && protocol && (this.protocol = protocol);
    // !this.host && host && (this.host = host);
    // !this.port && port && (this.port = port);
    !this.queries && queries && (this.queries = queries);

    const query = Object.entries(this.queries)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    const connectUrl = `${this.protocol}://${this.host}:${this.port}/${
      query ? `?q=${encodeURIComponent(query)}` : ""
    }`;

    this.socket = new WebSocket(connectUrl);
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
  }

  disconnect() {
    this.socket?.close();
  }

  /* intialize listeners */
  initialize() {
    /* intialize intercepter listeners */
    this.initListener(INTERCEPT.OPEN);
    this.initListener(INTERCEPT.CLOSE);
    this.initListener(INTERCEPT.ERROR);
    this.initListener(INTERCEPT.MESSAGE);
    this.initListener(INTERCEPT.BINARY_MESSAGE);
    this.initListener(INTERCEPT.NON_BINARY_MESSAGE);

    /* intialize signal listeners */
    this.initListener(SIGNAL.STREAM);
    this.initListener(SIGNAL.ROOM);
    this.initListener(SIGNAL.USER);
  }

  ifActivated(cb: Function) {
    this.activatePromise().then(() => {
      cb.call(this);
    });
  }

  onOpen(e: Event) {
    this.stateOpen = true;
    this.isActivate(true);
    LiveSocket.log("open");
    this.callEventListeners(INTERCEPT.OPEN, e);
  }

  onClose(e: CloseEvent) {
    LiveSocket.log("close");
    this.callEventListeners(INTERCEPT.CLOSE, e);
  }

  onError(e: Event) {
    LiveSocket.log("error");
    this.callEventListeners(INTERCEPT.ERROR, e);
  }

  onMessage(message: MessageEvent<any>) {
    const { data } = message;
    LiveSocket.log("message");
    this.callEventListeners(INTERCEPT.MESSAGE, data);
    try {
      // non-binary data
      const nonBinaryData = JSON.parse(data);
      this.callEventListeners(
        INTERCEPT.NON_BINARY_MESSAGE,
        data,
        nonBinaryData
      );
      this.callEventListeners(nonBinaryData.type, data, nonBinaryData);
    } catch (e) {
      // binary data
      const binaryData = this.decoding(data);
      this.callEventListeners(INTERCEPT.BINARY_MESSAGE, data, binaryData);
      this.callEventListeners(binaryData.type, data, binaryData);
    }
  }

  // use to message event
  callEventListeners(
    type: BasicLiveSocketEventType,
    message: Event | CloseEvent | MessageEvent<any>
  ): void;
  callEventListeners(
    type: DataLiveSocketEventType,
    message: Event | CloseEvent | MessageEvent<any>,
    data: DataType
  ): void;
  callEventListeners(
    a: LiveSocketEventType,
    b: Event | CloseEvent | MessageEvent<any>,
    c?: DataType
  ): void {
    if (c) {
      (this.events[a].listeners as DataLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b, c)
      );
      this.events[a].promise.forEach((prm) => prm(c));
    } else {
      (this.events[a].listeners as BasicLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b)
      );
      this.events[a].promise.forEach((prm) => prm(b));
    }
  }

  initListener(type: INTERCEPT | SIGNAL) {
    if (!this.events[type]) {
      this.events[type] = {
        promise: [],
        listeners: [],
      };
    }
  }

  on(
    type: BasicLiveSocketEventType,
    listener: BasicLiveSocketEventListenerType
  ): void;
  on(
    type: DataLiveSocketEventType,
    listener: DataLiveSocketEventListenerType
  ): void;
  on(
    type: any,
    listener: BasicLiveSocketEventListenerType & DataLiveSocketEventListenerType
  ): void {
    this.initListener(type);
    this.events[type].listeners.push(listener);
  }

  off(type: INTERCEPT | SIGNAL | (INTERCEPT | SIGNAL)[]) {
    if (type instanceof Array) {
      type.forEach((t) => {
        if (this.events[t]) {
          delete this.events[t];
        }
      });
    } else {
      if (this.events[type]) {
        delete this.events[type];
      }
    }
  }

  sendBinary(
    type: SIGNAL,
    action: LiveSocketBasicActionType,
    message?: Object
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketSpecialActionType,
    message?: Object
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketActionType,
    message?: Object
  ): Promise<any> {
    const packet = this.sendBinaryFormatting(type, action, message);
    this.socket?.send(packet);
    return new Promise((resolve) => {
      if (this.events[type]) {
        this.events[type].promise.push(resolve);
      }
    });
  }

  sendNonBinary(
    type: SIGNAL,
    action: LiveSocketBasicActionType,
    message: Object
  ): Promise<any>;
  sendNonBinary(
    type: SIGNAL,
    action: LiveSocketSpecialActionType,
    message: Object
  ): Promise<any>;
  sendNonBinary(
    type: SIGNAL,
    action: LiveSocketActionType,
    message: Object
  ): Promise<any> {
    const packet = this.sendNonBinaryFormatting(type, action, message);
    this.socket?.send(packet);
    return new Promise((resolve) => {
      if (this.events[type]) {
        this.events[type].promise.push(resolve);
      }
    });
  }

  encoding(message: Object) {
    const encoded = Message.encode(new Message(message)).finish();
    return encoded;
  }

  decoding(message: ArrayBuffer) {
    const decoded = Message.decode(new Uint8Array(message)).toJSON();
    return Object.assign(
      { ...decoded },
      {
        data: JSON.parse(decoded.data),
        result: JSON.parse(decoded.result),
      }
    ) as DataType;
  }

  sendNonBinaryFormatting(
    type: SIGNAL,
    action: LiveSocketActionType,
    data: any
  ) {
    return JSON.stringify({
      type,
      action,
      data,
      client: true,
      server: false,
    });
  }
  sendBinaryFormatting(
    type: SIGNAL,
    action: LiveSocketActionType,
    data: any = {}
  ) {
    return Message.encode(
      new Message({
        type,
        action,
        data: JSON.stringify(data),
        client: true,
        server: false,
      })
    ).finish();
  }

  join(roomId: string) {
    this.sendBinary(SIGNAL.ROOM, "update/join", {
      join: true,
      roomId: roomId,
    });
  }

  out(roomId: string) {
    this.sendBinary(SIGNAL.ROOM, "update/out", {
      out: true,
      roomId: roomId,
    });
  }
}
