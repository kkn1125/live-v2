"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BinaryHandler_1 = __importDefault(require("./BinaryHandler"));
const NonBinaryHandler_1 = __importDefault(require("./NonBinaryHandler"));
function messageHandler(app, ws, message, isBinary) {
    const handler = isBinary ? BinaryHandler_1.default : NonBinaryHandler_1.default;
    handler(app, ws, message);
}
exports.default = messageHandler;
