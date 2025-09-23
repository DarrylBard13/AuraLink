/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_STACK_PROJECT_ID: string
  readonly VITE_STACK_PUBLISHABLE_CLIENT_KEY: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}