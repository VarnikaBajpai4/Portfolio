import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Portrait } from '../icons/Portrait'
import { askPet, dropEverything } from '../shell/events'
import { useOpenApp } from '../shell/openApp'
import { complete, runCommand } from '../terminal/engine'
import { loadPython } from '../terminal/python'
import type { Python } from '../terminal/python'
import { setPalette } from '../theme'

type Line = { kind: 'in' | 'out'; text: string } | { kind: 'card'; lines: string[] }

const out = (text: string): Line => ({ kind: 'out', text })

const BANNER: Line[] = [out("Varnika's terminal."), out("Type 'help' to begin.")]

export function Terminal() {
  const openApp = useOpenApp()
  const [lines, setLines] = useState(BANNER)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState<number | null>(null)
  const [python, setPython] = useState<Python | null>(null)
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prompt = python ? '>>>' : '>'

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const print = (...added: Line[]) => setLines((prev) => [...prev, ...added])

  const startPython = async () => {
    setBusy(true)
    print(out('Loading Python (about 10 MB, one time)...'))
    try {
      const py = await loadPython()
      setPython(py)
      print(out('Python is ready. Type exit() to leave.'))
    } catch (error) {
      print(out(error instanceof Error ? error.message : 'Python did not load.'))
    }
    setBusy(false)
    inputRef.current?.focus()
  }

  const runPython = async (py: Python, code: string) => {
    if (/^(exit|quit)(\(\))?$/.test(code.trim())) {
      setPython(null)
      print({ kind: 'in', text: `>>> ${code}` }, out('Back to the terminal.'))
      return
    }
    setBusy(true)
    const output = await py.run(code)
    print({ kind: 'in', text: `>>> ${code}` }, ...output.map(out))
    setBusy(false)
    inputRef.current?.focus()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const command = value
    if (command.trim()) setHistory((h) => [...h, command])
    setCursor(null)
    setValue('')

    if (python) {
      void runPython(python, command)
      return
    }

    const result = runCommand(command)
    const action = result.action
    if (action?.type === 'clear') {
      setLines([])
      return
    }
    print(
      { kind: 'in', text: `> ${command}` },
      ...(result.portrait ? [{ kind: 'card', lines: result.lines } as Line] : result.lines.map(out)),
    )
    if (action?.type === 'open') openApp(action.app, action.param)
    if (action?.type === 'theme') setPalette(action.palette)
    if (action?.type === 'pet') askPet({ say: action.say, goto: action.goto })
    if (action?.type === 'gravity') dropEverything()
    if (action?.type === 'python') void startPython()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && value.trim() && !python) {
      e.preventDefault()
      const result = complete(value)
      if (result && 'value' in result) setValue(result.value)
      else if (result) print(out(result.options.join('  ')))
      return
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    if (history.length === 0) return
    const last = history.length - 1
    const next = e.key === 'ArrowUp' ? Math.max((cursor ?? history.length) - 1, 0) : (cursor ?? last) + 1
    if (next > last) {
      setCursor(null)
      setValue('')
    } else {
      setCursor(next)
      setValue(history[next])
    }
  }

  return (
    <div
      className="term"
      ref={scrollRef}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus()
      }}
    >
      <div className="term-log" role="log" aria-live="polite">
        {lines.map((line, i) =>
          line.kind === 'card' ? (
            <div key={i} className="term-card">
              <Portrait size={96} detailed />
              <div>
                {line.lines.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </div>
          ) : (
            <p key={i} className={line.kind === 'in' ? 'term-in' : undefined}>
              {line.text}
            </p>
          ),
        )}
      </div>
      <form className="term-form" onSubmit={submit}>
        <span aria-hidden="true">{prompt}</span>
        <input
          ref={inputRef}
          className="term-input"
          aria-label="Terminal input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={busy}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
