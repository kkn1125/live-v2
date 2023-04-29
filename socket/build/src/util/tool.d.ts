import type Room from "../model/Room";
declare const dev: {
    [k: string]: any;
} & {
    alias: (_prefix: string) => string;
};
declare const queryParser: (queries: string) => any;
declare const TEMP_PATH: (room: Room, filename?: string) => string;
export { dev, queryParser, TEMP_PATH };
