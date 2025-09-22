import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || "2c8de301-b7ca-4325-a27d-09079a7063be",
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_d2v8x1mnsy9vs7t5a5rv9vfdhe8p2pkk99ha2e5pbs048",
  tokenStore: "cookie"
});