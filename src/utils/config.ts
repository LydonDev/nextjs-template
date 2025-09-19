import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseToml } from 'toml'
import type { AppConfig } from '@/types/config'

const DEFAULT_CONFIG: AppConfig = {
  app: {
    port: 3000,
    version: '1.0.0',
    vitals: {
      enabled: true,
      path: './vitals',
      archive_after: '2d',
      max_files: 30,
      auto_cleanup: true
    }
  }
}

let cachedConfig: AppConfig | null = null

export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig
  }

  try {
    const configPath = join(process.cwd(), 'config.toml')
    const configContent = await readFile(configPath, 'utf-8')
    const parsedConfig = parseToml(configContent) as Partial<AppConfig>

    cachedConfig = mergeConfig(DEFAULT_CONFIG, parsedConfig)
    return cachedConfig
  } catch (error) {
    console.warn('Failed to load config.toml, using defaults:', error)
    cachedConfig = DEFAULT_CONFIG
    return cachedConfig
  }
}

function mergeConfig(defaultConfig: AppConfig, userConfig: Partial<AppConfig>): AppConfig {
  return {
    app: {
      version: userConfig.app?.version ?? defaultConfig.app.version,
      port: userConfig.app?.port ?? defaultConfig.app.port,
      vitals: {
        ...defaultConfig.app.vitals,
        ...userConfig.app?.vitals
      }
    }
  }
}

export function invalidateConfigCache(): void {
  cachedConfig = null
}