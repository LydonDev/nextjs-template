import type { LogEntry } from './vitals'

export interface AppConfig {
  app: {
    version: String,
    port: number,
    vitals: {
      enabled: boolean
      path: string
      archive_after: string
      max_files: number
      auto_cleanup: boolean
    }
  }
}

export type { LogEntry }