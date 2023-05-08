import path from "path";
import type Room from "../model/Room";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

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

const saveFilesAsEncode = ({
  room,
  buffer,
  prefix,
}: {
  room: Room;
  buffer: Uint8Array;
  prefix: string;
}) => {
  /* file write stream */
  const filename = prefix + "_" + room.chunkUploadCount + ".webm";
  const mp4Filename = prefix + "_" + room.chunkUploadCount + ".mp4";
  const m3u8Filename = prefix + "_" + room.chunkUploadCount + ".m3u8";
  const tsFilename = `${prefix + "_"}.ts`;

  const mp4Stream = fs.createWriteStream(TEMP_PATH(room, mp4Filename));
  const m3u8Stream = fs.createWriteStream(TEMP_PATH(room, m3u8Filename));
  const tsStream = fs.createWriteStream(TEMP_PATH(room, tsFilename));

  /* mp4 encoding */
  fs.writeFileSync(TEMP_PATH(room, filename), buffer);
  ffmpeg(TEMP_PATH(room, filename))
    .output(TEMP_PATH(room, mp4Filename))
    // .output(mp4Stream)
    // .input(TEMP_PATH(room, mp4Filename))
    // .output(TEMP_PATH(room, m3u8Filename))
    // .input(TEMP_PATH(room, m3u8Filename))
    // .output(TEMP_PATH(room, tsFilename))
    .on("end", function () {
      console.log("Finished processing for mp4");
      ffmpeg(TEMP_PATH(room, mp4Filename))
        .output(TEMP_PATH(room, m3u8Filename))
        // .output(m3u8Stream)
        .on("end", function () {
          console.log("Finished processing for m3u8");
          ffmpeg(TEMP_PATH(room, m3u8Filename))
            .output(TEMP_PATH(room, tsFilename))
            // .output(tsStream)
            .on("end", function () {
              console.log("Finished processing for ts");
            })
            .run();
        })
        .run();
    })
    .run();
};

export { dev, queryParser, TEMP_PATH, saveFilesAsEncode };
