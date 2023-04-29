"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_BRAND_NAME = exports.APP_AUTHOR = exports.APP_VERSION = exports.PORT = exports.HOST = exports.MODE = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const MODE = process.env.NODE_ENV;
exports.MODE = MODE;
dotenv_1.default.config({
    path: path_1.default.join(path_1.default.resolve(), ".env"),
});
dotenv_1.default.config({
    path: path_1.default.join(path_1.default.resolve(), `.env.${MODE}`),
});
const HOST = process.env.HOST;
exports.HOST = HOST;
const PORT = Number(process.env.PORT) || 4000;
exports.PORT = PORT;
const APP_VERSION = process.env.APP_VERSION;
exports.APP_VERSION = APP_VERSION;
const APP_AUTHOR = process.env.APP_AUTHOR;
exports.APP_AUTHOR = APP_AUTHOR;
const APP_BRAND_NAME = process.env.APP_BRAND_NAME;
exports.APP_BRAND_NAME = APP_BRAND_NAME;
