"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs = __importStar(require("protobufjs"));
const { Message } = protobufjs;
class Parser {
    isBinary;
    constructor(isBinary) {
        this.isBinary = isBinary;
    }
    encode(obj, result) {
        const encoder = this.isBinary
            ? this.#encodeObjectToBinary.bind(this)
            : this.#encodeObjectToString.bind(this);
        return encoder(obj, result);
    }
    decode(data) {
        const decoder = this.isBinary
            ? this.#decodeBinaryToJSON.bind(this)
            : this.#decodeStringToJSON.bind(this);
        return decoder(data);
    }
    #wrapResult(origin, result) {
        return Object.assign({ ...origin }, {
            data: this.isBinary ? JSON.stringify(origin.data) : origin.data,
            result: this.isBinary ? JSON.stringify(result) : result,
            server: true,
            client: false,
        });
    }
    #encodeObjectToBinary(obj, result) {
        const wrapped = this.#wrapResult(obj, result);
        return Message.encode(new Message(wrapped)).finish();
    }
    #encodeObjectToString(obj, result) {
        const wrapped = this.#wrapResult(obj, result);
        return JSON.stringify(wrapped);
    }
    #decodeBinaryToJSON(binary) {
        return Message.decode(new Uint8Array(binary)).toJSON();
    }
    #decodeStringToJSON(str) {
        return JSON.parse(str);
    }
}
class BaseManager {
    isBinary;
    parser;
    constructor(isBinary) {
        this.isBinary = isBinary;
        this.parser = new Parser(this.isBinary);
    }
    sendMe(ws, data, result = {}) {
        ws.send(this.parser.encode(data, result), this.isBinary);
    }
    sendOther(ws, to, data, result = {}) {
        ws.publish(to, this.parser.encode(data, result), this.isBinary);
    }
    publishBinaryTo(app, ws, to, data, result = {}) {
        app.publish(to, this.parser.encode(data, result), this.isBinary);
    }
    publish(app, ws, data, result = {}) {
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
class PublishManager {
    manager;
    constructor(isBinary) {
        const manager = new (isBinary ? BinaryManager : NonBinaryManager)();
        this.manager = manager;
    }
}
exports.default = PublishManager;
