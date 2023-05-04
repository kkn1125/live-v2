import path from "path";
import type Room from "../model/Room";

const MODE = process.env.NODE_ENV || "production";

const IS_DEV = MODE === "development";

const dev = function (this: Console) {
  let prefix = "";
  return Object.assign(
    Object.fromEntries(
      Object.entries(console).map(([k, v]) =>
        k === "memory"
          ? [k, v]
          : [
              k,
              (...args: any[]) => {
                (IS_DEV ? v : () => {}).call(this, prefix, ...args);
                prefix = "";
              },
            ]
      )
    ),
    { alias: (_prefix: string) => (prefix = _prefix) }
  );
}.call(console);

const queryParser = (queries: string) =>
  Object.fromEntries(queries.split("&").map((query) => query.split("=")));

const TEMP_PATH = (room: Room, filename?: string) =>
  path.join(path.resolve(), "tmp", room.id, filename || "");

export { dev, queryParser, TEMP_PATH };
