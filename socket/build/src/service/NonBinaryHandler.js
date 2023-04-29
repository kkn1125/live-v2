"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Publisher_1 = __importDefault(require("../model/Publisher"));
const publisher = new Publisher_1.default(false);
function nonBinaryHandler(app, ws, message) {
    const decoded = JSON.parse(new TextDecoder().decode(message));
    console.log("non binary", decoded);
    const base = {
        type: decoded.type,
        action: decoded.action,
        data: decoded.data,
    };
    publisher.manager.sendMe(ws, base);
}
exports.default = nonBinaryHandler;
