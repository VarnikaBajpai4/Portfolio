import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../../content'
import { Icon } from '../../icons/Icon'
import { prefersReducedMotion } from '../../motion'
import './malshield.css'
import { Showcase } from './Showcase'
import type { ShowcaseCopy } from './Showcase'

const COPY: ShowcaseCopy = {
  tagline: 'Drop in a file. Get a verdict, and the reasons for it.',
  overview: [
    'Most scanners answer with one word: safe or not. MalShield says why, so a person can judge the call.',
    'It works out what kind of file it has, then sends it to the right analyser. Windows programs get EMBER features and a LightGBM model. Linux binaries, batch scripts and documents each have their own path. RetDec decompiles the code to look for calls that inject into other processes, YARA rules look for known patterns, and Gemini names the likely malware family with a short reason.',
  ],
  meta: 'Built at a hackathon by team Ctrl Alt Elite. Each analyser runs in its own Docker container.',
  stack: [
    { layer: 'Interface', parts: ['React', 'Vite', 'Tailwind CSS'] },
    { layer: 'API', parts: ['Python', 'FastAPI', 'python-magic'] },
    { layer: 'Analysers', parts: ['EMBER', 'LightGBM', 'RetDec', 'YARA', 'Docker'] },
    { layer: 'Reasoning', parts: ['Gemini'] },
  ],
  steps: [
    { name: 'Unpack', text: 'Archives are opened, including archives inside archives.' },
    { name: 'Identify', text: 'The real file type is read from its contents, not its name.' },
    { name: 'Extract', text: 'Features are pulled out: headers, imports, strings, entropy.' },
    { name: 'Predict', text: 'A model for that file type gives a probability.' },
    { name: 'Match', text: 'YARA rules and decompiled code are checked for known behaviour.' },
    { name: 'Explain', text: 'Gemini names the likely family and gives a reason.' },
  ],
  demoTitle: 'Scan a file',
  demoHint: 'Pick one of three made-up files. A recorded example: nothing here is real malware.',
}

interface Sample {
  id: string
  name: string
  kind: string
  model: string
  probability: number
  verdict: 'Clean' | 'Suspicious' | 'Malicious'
  findings: string[]
  family?: string
}

const SAMPLES: Sample[] = [
  {
    id: 'doc',
    name: 'invoice_march.docx',
    kind: 'Word document',
    model: 'document features',
    probability: 0.03,
    verdict: 'Clean',
    findings: ['No macros', 'No embedded programs', 'No YARA rule matched'],
  },
  {
    id: 'exe',
    name: 'free_game_setup.exe',
    kind: 'Windows program',
    model: 'EMBER + LightGBM',
    probability: 0.97,
    verdict: 'Malicious',
    findings: ['Calls VirtualAlloc and WriteProcessMemory', 'Packed section with high entropy', 'One YARA rule matched'],
    family: 'Trojan family',
  },
  {
    id: 'bat',
    name: 'cleanup.bat',
    kind: 'Batch script',
    model: 'script vectoriser',
    probability: 0.71,
    verdict: 'Suspicious',
    findings: ['Deletes backup copies', 'Turns off a system service', 'No YARA rule matched'],
  },
]

const GATES = ['Identify', 'Extract', 'Predict', 'Match']
const GATE_MS = 520

export function MalShield({ project, onBack }: { project: Project; onBack: () => void }) {
  const [sample, setSample] = useState<Sample | null>(null)
  const [passed, setPassed] = useState(0)
  const done = sample !== null && passed >= GATES.length

  useEffect(() => {
    if (!sample || passed >= GATES.length) return
    const timer = window.setTimeout(() => setPassed((n) => n + 1), GATE_MS)
    return () => window.clearTimeout(timer)
  }, [sample, passed])

  const scan = (next: Sample) => {
    setSample(next)
    setPassed(prefersReducedMotion() ? GATES.length : 0)
  }

  const gateDetail = sample ? [sample.kind, 'headers, imports, strings', sample.model, 'YARA and decompiled code'] : []

  return (
    <Showcase project={project} copy={COPY} theme="show-malshield" onBack={onBack}>
      <div className="show-demo">
        <section className="show-pane" aria-label="Scanner">
          <h4>Choose a file</h4>
          <div className="ms-files">
            {SAMPLES.map((s) => (
              <button key={s.id} type="button" className="ms-file" aria-pressed={s.id === sample?.id} onClick={() => scan(s)}>
                <Icon name="doc" size={36} fill="var(--paper)" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          <div className={`ms-scanner px-border${sample && !done ? ' is-scanning' : ''}`}>
            <div className="ms-target">
              <Icon name="doc" size={64} fill="var(--paper)" />
              <span className="ms-beam" aria-hidden="true" />
            </div>
            <ol className="ms-gates">
              {GATES.map((gate, i) => (
                <li key={gate} className={sample && i < passed ? 'is-done' : sample && i === passed ? 'is-now' : undefined}>
                  <strong>{gate}</strong>
                  <span>{sample && i < passed ? gateDetail[i] : ' '}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="show-pane show-pane-tint" aria-label="Report" aria-live="polite">
          <h4>Report</h4>
          {sample && done ? (
            <div className="ms-report" key={sample.id}>
              <p className={`ms-verdict is-${sample.verdict.toLowerCase()}`}>{sample.verdict}</p>
              <p className="ms-file-name">{sample.name}</p>
              <div className="ms-meter" style={{ '--level': `${sample.probability * 100}%` } as CSSProperties}>
                <i />
                <span>{Math.round(sample.probability * 100)}% likely malicious</span>
              </div>
              <ul className="ms-findings">
                {sample.findings.map((finding) => (
                  <li key={finding}>{finding}</li>
                ))}
              </ul>
              {sample.family && (
                <p className="ms-family">
                  Likely family: <strong>{sample.family}</strong>
                </p>
              )}
            </div>
          ) : (
            <p className="show-note">{sample ? 'Scanning...' : 'Pick a file to scan.'}</p>
          )}
          <p className="show-note">The verdict always comes with the evidence behind it.</p>
        </section>
      </div>
    </Showcase>
  )
}
