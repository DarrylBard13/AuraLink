import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  projectId: "2c8de301-b7ca-4325-a27d-09079a7063be",
  publishableClientKey: "pck_d2v8x1mnsy9vs7t5a5rv9vfdhe8p2pkk99ha2e5pbs048",
  tokenStore: "cookie",
  baseUrl: process.env.NODE_ENV === 'production'
    ? "https://aura-link-6pt4yq9m3-darrylbard13s-projects.vercel.app"
    : "http://localhost:5173"
});