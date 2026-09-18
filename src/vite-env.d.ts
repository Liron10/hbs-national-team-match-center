/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_DEMO_DATA?: string
  readonly VITE_BASE?: string
  readonly VITE_FOOTBALL_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
