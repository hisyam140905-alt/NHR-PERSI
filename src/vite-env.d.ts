/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Add safe, frontend-only variables here in the future
  // e.g., readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}