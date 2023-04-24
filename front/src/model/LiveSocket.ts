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
import { convert } from "../util/tool";

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

  protocol: string;
  host: string;
  port: number;
  queries: Object;

  socket: WebSocket;
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

  connect(queries: Object) {
    /* 기본 값 없으면 새로 받아서 다시 설정 */
    // !this.protocol && protocol && (this.protocol = protocol);
    // !this.host && host && (this.host = host);
    // !this.port && port && (this.port = port);
    queries && (this.queries = queries);

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

  onMessage({ data }) {
    LiveSocket.log("message", data);
    this.callEventListeners(INTERCEPT.MESSAGE, data);
    try {
      // non-binary data
      const nonBinaryData = JSON.parse(data);
      console.log("nonBinaryData", nonBinaryData);
      this.callEventListeners(nonBinaryData.type, data, nonBinaryData);
    } catch (e) {
      // binary data
      const binaryData = this.decoding(data);
      console.log("binaryData", binaryData);
      this.callEventListeners(binaryData.type, data, convert(binaryData));
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
    console.log(this.events);
    if (c) {
      (this.events[a].listeners as DataLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b, c)
      );
      this.events[a].promise.forEach((prm) => prm(c));
      this.events[a].promise = [];
    } else {
      (this.events[a].listeners as BasicLiveSocketEventListenerType[]).forEach(
        (cb) => cb.call(this, a, b)
      );
      this.events[a].promise.forEach((prm) => prm(b));
      this.events[a].promise = [];
    }
  }

  initListener(type: LiveSocketEventType) {
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

  off(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }

  sendBinary(
    type: SIGNAL,
    action: LiveSocketBasicActionType,
    message: Object
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketSpecialActionType,
    message: Object
  ): Promise<any>;
  sendBinary(
    type: SIGNAL,
    action: LiveSocketActionType,
    message: Object
  ): Promise<any> {
    const packet = this.sendBinaryFormatting(type, action, message);
    this.socket.send(packet);
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
    this.socket.send(packet);
    return new Promise((resolve) => {
      this.events[type].promise.push(resolve);
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
    return this.encoding({
      type,
      action,
      data: JSON.stringify(data),
    });
  }
}
