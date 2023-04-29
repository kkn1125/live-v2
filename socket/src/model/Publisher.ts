import uWS, { TemplatedApp } from "uWebSockets.js";
import * as protobufjs from "protobufjs";

const { Message } = protobufjs;

class Parser {
  isBinary: boolean;

  constructor(isBinary: boolean) {
    this.isBinary = isBinary;
  }

  encode(obj: Object, result: Object) {
    const encoder = this.isBinary
      ? this.#encodeObjectToBinary.bind(this)
      : this.#encodeObjectToString.bind(this);
    return encoder(obj, result);
  }
  decode(data: any) {
    const decoder = this.isBinary
      ? this.#decodeBinaryToJSON.bind(this)
      : this.#decodeStringToJSON.bind(this);
    return decoder(data);
  }
  #wrapResult(origin: any, result: Object) {
    return Object.assign(
      { ...origin },
      {
        data: this.isBinary ? JSON.stringify(origin.data) : origin.data,
        result: this.isBinary ? JSON.stringify(result) : result,
        server: true,
        client: false,
      }
    );
  }
  #encodeObjectToBinary(obj: Object, result: Object) {
    const wrapped = this.#wrapResult(obj, result);
    return Message.encode(new Message(wrapped)).finish();
  }
  #encodeObjectToString(obj: Object, result: Object) {
    const wrapped = this.#wrapResult(obj, result);
    return JSON.stringify(wrapped);
  }
  #decodeBinaryToJSON(binary: ArrayBuffer) {
    return Message.decode(new Uint8Array(binary)).toJSON();
  }
  #decodeStringToJSON(str: string) {
    return JSON.parse(str);
  }
}

class BaseManager {
  isBinary: boolean;
  parser: Parser;

  constructor(isBinary: boolean) {
    this.isBinary = isBinary;
    this.parser = new Parser(this.isBinary);
  }

  sendMe(ws: uWS.WebSocket<unknown>, data: Object, result: Object = {}) {
    ws.send(this.parser.encode(data, result), this.isBinary);
  }
  sendOther(
    ws: uWS.WebSocket<unknown>,
    to: string,
    data: Object,
    result: Object = {}
  ) {
    ws.publish(to, this.parser.encode(data, result), this.isBinary);
  }
  publishBinaryTo(
    app: TemplatedApp,
    ws: uWS.WebSocket<unknown>,
    to: string,
    data: Object,
    result: Object = {}
  ) {
    app.publish(to, this.parser.encode(data, result), this.isBinary);
  }
  publish(
    app: TemplatedApp,
    ws: uWS.WebSocket<unknown>,
    data: Object,
    result: Object = {}
  ) {
    app.publish("global", this.parser.encode(data, result), this.isBinary);
  }
}

class BinaryManager extends BaseManager {
  constructor() {
    super(true);
  }
}
class NonBinaryManager extends BaseManager {
  constructor() {
    super(false);
  }
}

export default class PublishManager {
  manager: BinaryManager | NonBinaryManager;
  constructor(isBinary: boolean) {
    const manager = new (isBinary ? BinaryManager : NonBinaryManager)();
    this.manager = manager;
  }
}
