// A real Python interpreter (Pyodide), downloaded only when someone asks for it.

const VERSION = '0.28.3'
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`

interface Pyodide {
  runPythonAsync(code: string): Promise<unknown>
  setStdout(options: { batched: (line: string) => void }): void
  setStderr(options: { batched: (line: string) => void }): void
  globals: { get(name: string): (value: unknown) => string }
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<Pyodide>
  }
}

export interface Python {
  /** Run one line and return what it printed, plus the value of a bare expression. */
  run(code: string): Promise<string[]>
}

let loading: Promise<Python> | null = null

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not download Python. Check your connection.'))
    document.head.append(script)
  })
}

async function start(): Promise<Python> {
  await loadScript(`${BASE}pyodide.js`)
  const pyodide = await window.loadPyodide!({ indexURL: BASE })
  let output: string[] = []
  pyodide.setStdout({ batched: (line) => output.push(line) })
  pyodide.setStderr({ batched: (line) => output.push(line) })

  return {
    async run(code) {
      output = []
      try {
        const value = await pyodide.runPythonAsync(code)
        if (value !== undefined && value !== null) output.push(pyodide.globals.get('repr')(value))
      } catch (error) {
        // keep the last line of the traceback: the error type and message
        const text = error instanceof Error ? error.message : String(error)
        output.push(text.trim().split('\n').pop() ?? 'Error')
      }
      return output
    },
  }
}

export function loadPython(): Promise<Python> {
  loading ??= start().catch((error) => {
    loading = null
    throw error
  })
  return loading
}
