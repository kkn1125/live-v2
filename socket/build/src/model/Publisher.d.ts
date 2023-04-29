import uWS, { TemplatedApp } from "uWebSockets.js";
declare class Parser {
    #private;
    isBinary: boolean;
    constructor(isBinary: boolean);
    encode(obj: Object, result: Object): string | Uint8Array;
    decode(data: any): any;
}
declare class BaseManager {
    isBinary: boolean;
    parser: Parser;
    constructor(isBinary: boolean);
    sendMe(ws: uWS.WebSocket<unknown>, data: Object, result?: Object): void;
    sendOther(ws: uWS.WebSocket<unknown>, to: string, data: Object, result?: Object): void;
    publishBinaryTo(app: TemplatedApp, ws: uWS.WebSocket<unknown>, to: string, data: Object, result?: Object): void;
    publish(app: TemplatedApp, ws: uWS.WebSocket<unknown>, data: Object, result?: Object): void;
}
declare class BinaryManager extends BaseManager {
    constructor();
}
declare class NonBinaryManager extends BaseManager {
    constructor();
}
export default class PublishManager {
    manager: BinaryManager | NonBinaryManager;
    constructor(isBinary: boolean);
}
export {};
