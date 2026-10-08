import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useOpenApp } from '../shell/openApp'
import { runCommand } from '../terminal/engine'
import { setPalette } from '../theme'

interface Line {
  kind: 'in' | 'out'
  text: string
}

const BANNER: Line[] = [
  { kind: 'out', text: "Varnika's terminal." },
  { kind: 'out', text: "Type 'help' to begin." },
]

export function Terminal() {
  const openApp = useOpenApp()
  const [lines, setLines] = useState(BANNER)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = runCommand(value)
    if (value.trim()) setHistory((h) => [...h, value])
    setCursor(null)
    setValue('')

    if (result.action?.type === 'clear') {
      setLines([])
      return
    }
    setLines((prev) => [
      ...prev,
      { kind: 'in', text: value },
      ...result.lines.map((text): Line => ({ kind: 'out', text })),
    ])
    if (result.action?.type === 'open') openApp(result.action.app, result.action.param)
    if (result.action?.type === 'theme') setPalette(result.action.palette)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        {lines.map((line, i) => (
          <p key={i} className={line.kind === 'in' ? 'term-in' : undefined}>
            {line.kind === 'in' ? `> ${line.text}` : line.text}
          </p>
        ))}
      </div>
      <form className="term-form" onSubmit={submit}>
        <span aria-hidden="true">&gt;</span>
        <input
          ref={inputRef}
          className="term-input"
          aria-label="Terminal input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
