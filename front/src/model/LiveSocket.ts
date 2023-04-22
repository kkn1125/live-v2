import protobufjs from "protobufjs";
import { INTERCEPT, LIVE_SOCKET_ACTION, SIGNAL } from "../util/global";

const { Field, Message } = protobufjs;

const fields = ["id", "action", "data", "file", "result"];

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
  events: any[] = [];

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
    this.socket.onopen = this.onOpen;
    this.socket.onclose = this.onClose;
    this.socket.onerror = this.onError;
    this.socket.onmessage = this.onMessage;
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
    LiveSocket.log("open", e);
    this.callEventListeners([INTERCEPT.OPEN], e);
  }

  onClose(e) {
    LiveSocket.log("close", e);
    this.callEventListeners([INTERCEPT.CLOSE], e);
  }

  onError(e) {
    LiveSocket.log("error", e);
    this.callEventListeners([INTERCEPT.ERROR], e);
  }

  onMessage(message) {
    LiveSocket.log("message", message);
    this.callEventListeners([INTERCEPT.MESSAGE], message);
    try {
      // non-binary data
      const nonBinaryData = JSON.parse(message);
      this.callEventListeners(
        [INTERCEPT.NON_BINARY_MESSAGE],
        message,
        nonBinaryData
      );
    } catch (e) {
      // binary data
      const binaryData = this.decoding(message);
      this.callEventListeners([INTERCEPT.BINARY_MESSAGE], message, binaryData);
    }
  }

  // use to message event
  callEventListeners(type, message): void;
  callEventListeners(type, message, data): void;
  callEventListeners(a, b, c?: any) {
    if (c) {
      this.events[a].listeners.forEach((cb) => cb.call(this, a, b, c));
    } else {
      this.events[a].listeners.forEach((cb) => cb.call(this, a, b));
    }
  }

  initListener(type) {
    if (!this.events[type]) {
      this.events[type] = {
        data: {}, // 필요없을수도?
        listeners: [],
      };
    }
  }

  on(type, listener) {
    this.initListener(type);
    this.events[type].listeners.push(listener);
  }

  off(type) {
    if (this.events[type]) {
      delete this.events[type];
    }
  }

  sendBinary(message: ArrayBuffer) {
    this.socket.send(message);
  }

  sendNonBinary(message: Object) {
    this.socket.send(JSON.stringify(message));
  }

  encoding(message: Object) {
    const encoded = Message.encode(new Message(message)).finish();
    this.sendBinary(encoded);
  }

  decoding(message: ArrayBuffer) {
    const decoded = Message.decode(new Uint8Array(message)).toJSON();
    return decoded;
  }
}
