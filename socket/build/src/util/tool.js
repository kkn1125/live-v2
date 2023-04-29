"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEMP_PATH = exports.queryParser = exports.dev = void 0;
const path_1 = __importDefault(require("path"));
const dev = function () {
    let prefix = "";
    return Object.assign(Object.fromEntries(Object.entries(console).map(([k, v]) => k === "memory"
        ? [k, v]
        : [
            k,
            (...args) => {
                v.call(this, prefix, ...args);
                prefix = "";
            },
        ])), { alias: (_prefix) => (prefix = _prefix) });
}.call(console);
exports.dev = dev;
const queryParser = (queries) => Object.fromEntries(queries.split("&").map((query) => query.split("=")));
exports.queryParser = queryParser;
const TEMP_PATH = (room, filename) => path_1.default.join(path_1.default.resolve(), "tmp", room.id, filename || "");
exports.TEMP_PATH = TEMP_PATH;
