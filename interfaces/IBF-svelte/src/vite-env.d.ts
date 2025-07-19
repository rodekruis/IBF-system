// Environment configuration for Vite
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GEOSERVER_URL: string
  readonly VITE_ESPOCRM_API_URL: string
  readonly VITE_USE_MOCK_DATA: string
  readonly VITE_USE_IBF_API: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_SHOW_DEBUG_PANEL: string
  readonly VITE_DISABLE_API_CACHE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
