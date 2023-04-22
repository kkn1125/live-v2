import protobufjs from "protobufjs";
import type {
  BasicLiveSocketEventListenerType,
  BasicLiveSocketEventType,
  DataLiveSocketEventListenerType,
  DataLiveSocketEventType,
  LiveSocketActionType,
  LiveSocketBasicActionType,
  LiveSocketEventListenerType,
  LiveSocketEventType,
  LiveSocketSpecialActionType,
} from "../util/global";
import { INTERCEPT, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";

const { Field, Message } = protobufjs;

const fields = ["id", "action", "data", "file", "result", "client", "server"];

for (let index in fields) {
  switch (fields[index]) {
    case "id":
      Field.d(
        Number(index),
        "float",
        "optional"
      )(Message.prototype, fields[index]);
      break;
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

  protocol: string;
  host: string;
  port: number;
  queries: Object = "";

  socket: WebSocket;
  events: {
    [key: string]: {
      promise: (value: any) => void;
      listeners:
        | BasicLiveSocketEventListenerType[]
        | DataLiveSocketEventListenerType[];
    };
  };

  constructor(protocol?: "wss" | "ws", host?: string, port?: number) {
    /* 기본 값 세팅 */
    protocol && (this.protocol = protocol);
    host && (this.host = host);
    port && (this.port = port);
  }

  connect(queries: Object = "") {
    /* 기본 값 없으면 새로 받아서 다시 설정 */
    // !this.protocol && protocol && (this.protocol = protocol);
    // !this.host && host && (this.host = host);
    // !this.port && port && (this.port = port);
    !this.queries && queries && (this.queries = queries);

    const query = Object.entries(this.queries)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    const connectUrl = `${this.protocol}://${this.host}:${this.port}/${
      query || `?${query}`
    }`;

    this.socket = new WebSocket(connectUrl);
    this.socket.binaryType = "arraybuffer";
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
    this.socket.onmessage = this.onMessage.bind(this);
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

  onOpen(e) {
    LiveSocket.log("open");
    this.callEventListeners(INTERCEPT.OPEN, e);
  }

  onClose(e) {
    LiveSocket.log("close");
    this.callEventListeners(INTERCEPT.CLOSE, e);
  }

  onError(e) {
    LiveSocket.log("error");
    this.callEventListeners(INTERCEPT.ERROR, e);
  }

  onMessage(message) {
    LiveSocket.log("message");
    this.callEventListeners(INTERCEPT.MESSAGE, message);
    try {
      // non-binary data
      const nonBinaryData = JSON.parse(message);
      this.callEventListeners(
        INTERCEPT.NON_BINARY_MESSAGE,
        message,
        nonBinaryData
      );
    } catch (e) {
      // binary data
      const binaryData = this.decoding(message);
      this.callEventListeners(INTERCEPT.BINARY_MESSAGE, message, binaryData);
    }
  }

  // use to message event
  callEventListeners(
    type: BasicLiveSocketEventType,
    message: MessageEvent<any>
  ): void;
  callEventListeners(
    type: DataLiveSocketEventType,
    message: MessageEvent<any>,
    data: Object
  ): void;
  callEventListeners(
    a: LiveSocketEventType,
    b: MessageEvent<any>,
    c?: Object
  ): void {
    if (c) {
      (this.events[a].listeners as DataLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b, c)
      );
      this.events[a].promise(c);
    } else {
      (this.events[a].listeners as BasicLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b)
      );
      this.events[a].promise(b);
    }
  }

  initListener(type) {
    if (!this.events[type]) {
      this.events[type] = {
        promise: (value: any) => {}, // 필요없을수도?
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

  off(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }

  sendBinary(
    type: SIGNAL,
    action: LiveSocketBasicActionType,
    message: ArrayBuffer
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketSpecialActionType,
    message: ArrayBuffer
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketActionType,
    message: ArrayBuffer
  ): Promise<any> {
    const packet = this.sendNonBinaryFormatting(type, action, message);
    this.socket.send(packet);
    return new Promise((resolve) => {
      if (this.events[type]) {
        this.events[type].promise = resolve;
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
    this.socket.send(packet);
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  encoding(message: Object) {
    const encoded = Message.encode(new Message(message)).finish();
    return encoded;
  }

  decoding(message: ArrayBuffer) {
    const decoded = Message.decode(new Uint8Array(message)).toJSON();
    return decoded;
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
    });
  }
  sendBinaryFormatting(type: SIGNAL, action: LiveSocketActionType, data: any) {
    return {
      type,
      action,
      data: JSON.stringify(data),
    };
  }
}
