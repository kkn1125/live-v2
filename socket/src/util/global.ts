import dotenv from "dotenv";
import path from "path";

const MODE = process.env.NODE_ENV;

dotenv.config({
  path: path.join(path.resolve(), ".env"),
});
dotenv.config({
  path: path.join(path.resolve(), `.env.${MODE}`),
});

const HOST = process.env.HOST;
const PORT = Number(process.env.PORT) || 4000;

const APP_VERSION = process.env.APP_VERSION;
const APP_AUTHOR = process.env.APP_AUTHOR;
const APP_BRAND_NAME = process.env.APP_BRAND_NAME;

export { MODE, HOST, PORT, APP_VERSION, APP_AUTHOR, APP_BRAND_NAME };
