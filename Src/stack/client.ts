import { StackClientApp } from "@stackframe/react";
import { useNavigate } from "react-router-dom";

export const stackClientApp = new StackClientApp({
  // Environment variables for Stack Auth
  projectId: import.meta.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: "cookie",
  redirectMethod: {
    useNavigate,
  }
});