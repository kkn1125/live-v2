import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";

export default defineConfig(({ command, mode, ssrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const MODE = process.env.NODE_ENV;
  dotenv.config({
    path: path.join(path.resolve(), ".env"),
  });
  dotenv.config({
    path: path.join(path.resolve(), `.env.${MODE}`),
  });

  return {
    // vite config
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    base: "",
    server: {
      host: process.env.HOST,
      port: Number(process.env.PORT) || 3000,
      cors: true,
      proxy: {
        "/tuto": {
          target: "https://www.tutorialspoint.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tuto/, ""),
        },
        "/hls": {
          target: "http://localhost:4000/hls",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/hls/, ""),
        },
      },
      ...(mode === "production"
        ? {
            hmr: {
              protocol: process.env.VITE_SOCKET_PROTOCOL,
              host: process.env.VITE_SOCKET_HOST,
              port: Number(process.env.VITE_SOCKET_PORT),
              overlay: true,
              clientPort: Number(process.env.PORT) || 3000,
            },
          }
        : {}),
    },
    plugins: [react()],
  };
});
