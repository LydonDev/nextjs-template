import { readFileSync } from 'fs'
import { spawn } from 'child_process'
import toml from 'toml'

let port = 3000
try {
  const configContent = readFileSync('./config.toml', 'utf8')
  const config = toml.parse(configContent)
  port = config.app?.port || 3000
} catch (error) {
  console.warn('Could not read config.toml, using default port 3000')
}

const nextProcess = spawn('next', ['dev', '--turbo', '--port', port.toString()], {
  stdio: 'inherit',
  shell: true
})

nextProcess.on('close', (code) => {
  process.exit(code)
})