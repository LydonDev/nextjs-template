import { writeFile, mkdir, readFile, stat, readdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import type { LogEntry, AppConfig } from '@/types/config'

export class VitalsLogger {
  private pendingEntries: LogEntry[] = []
  private flushTimeout: NodeJS.Timeout | null = null

  async logEntry(entry: LogEntry, config: AppConfig): Promise<void> {
    if (!config.app.vitals.enabled) return

    this.pendingEntries.push(entry)

    if (this.pendingEntries.length >= 10) {
      await this.flushEntries(config)
    } else {
      this.scheduleFlush(config)
    }
  }

  private scheduleFlush(config: AppConfig): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }

    this.flushTimeout = setTimeout(() => {
      this.flushEntries(config)
    }, 5000)
  }

  private async flushEntries(config: AppConfig): Promise<void> {
    if (this.pendingEntries.length === 0) return

    try {
      const vitalsDir = join(process.cwd(), config.app.vitals.path)
      const filename = this.getLogFileName()
      const filePath = join(vitalsDir, filename)

      await mkdir(vitalsDir, { recursive: true })

      let existingEntries: LogEntry[] = []
      try {
        const existingContent = await readFile(filePath, 'utf-8')
        const existingData = JSON.parse(existingContent)
        existingEntries = Array.isArray(existingData.entries) ? existingData.entries : []
      } catch {
        existingEntries = []
      }

      const allEntries = [...existingEntries, ...this.pendingEntries]

      if (allEntries.length > 1000) {
        const overflow = allEntries.length - 1000
        allEntries.splice(0, overflow)
      }

      const logData = {
        version: '1.0',
        created: existingEntries.length === 0 ? new Date().toISOString() : undefined,
        updated: new Date().toISOString(),
        entries: allEntries,
        metadata: {
          total_entries: allEntries.length,
          file_size_kb: Math.round(JSON.stringify(allEntries).length / 1024)
        }
      }

      await writeFile(filePath, JSON.stringify(logData, null, 2))

      console.log(`Flushed ${this.pendingEntries.length} vitals entries to ${filename}`)

      this.pendingEntries = []

      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout)
        this.flushTimeout = null
      }

      if (config.app.vitals.auto_cleanup) {
        await this.cleanupOldFiles(config)
      }

    } catch (error) {
      console.error('Failed to flush vitals entries:', error)
    }
  }

  private getLogFileName(): string {
    const now = new Date()
    return `vitals-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`
  }

  private async cleanupOldFiles(config: AppConfig): Promise<void> {
    try {
      const vitalsDir = join(process.cwd(), config.app.vitals.path)
      const files = await readdir(vitalsDir)
      const vitalsFiles = files.filter(file => file.startsWith('vitals-'))

      if (vitalsFiles.length > config.app.vitals.max_files) {
        const filesToDelete = vitalsFiles.slice(0, vitalsFiles.length - config.app.vitals.max_files)

        for (const file of filesToDelete) {
          const filePath = join(vitalsDir, file)
          const stats = await stat(filePath)
          const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)

          const archiveDays = parseInt(config.app.vitals.archive_after.replace('d', ''))
          if (ageInDays > archiveDays) {
            await unlink(filePath)
            console.log(`Cleaned up old vitals file: ${file}`)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old vitals files:', error)
    }
  }
}