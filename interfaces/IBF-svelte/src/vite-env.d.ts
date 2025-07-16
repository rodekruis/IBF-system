// Environment configuration for Vite
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GEOSERVER_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_EMBED_ALLOWED_ORIGINS: string
  readonly VITE_DEBUG: string
  readonly VITE_AZURE_CLIENT_ID: string
  readonly VITE_AZURE_TENANT_ID: string
  readonly VITE_AZURE_REDIRECT_URI: string
  readonly VITE_AZURE_SCOPES: string
  readonly VITE_REQUIRE_AUTH: string
  readonly VITE_VALIDATE_JWT: string
  readonly VITE_CORS_DOMAINS: string
  readonly VITE_CSP_FRAME_ANCESTORS: string
  readonly VITE_DISABLE_AUTHENTICATION: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_USE_IBF_API: string
  readonly VITE_IBF_API_EMAIL: string
  readonly VITE_IBF_API_PASSWORD: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_SHOW_DEBUG_PANEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
