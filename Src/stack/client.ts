import { StackClientApp } from "@stackframe/react";
import { useNavigate } from "react-router-dom";

export const stackClientApp = new StackClientApp({
  // Environment variables for Stack Auth
  projectId: "2c8de301-b7ca-4325-a27d-09079a7063be",
  publishableClientKey: "pck_bjqjcvyx0njrq7mzk3eqwz51rtea6kfdvvjrtje3dvgcr",
  tokenStore: "cookie",
  redirectMethod: {
    useNavigate,
  }
});