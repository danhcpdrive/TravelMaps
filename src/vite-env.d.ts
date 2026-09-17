/// <reference types="vite/client" />

declare module '*.sql?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_ID?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
