// One small program, written in the five languages OmniCompiler runs, with a recorded debug run.

/** A statement of the program. Every language has a line for each one. */
export type NodeId = 'init' | 'loop' | 'mid' | 'equal' | 'found' | 'less' | 'right' | 'left' | 'missing'

export interface CodeLine {
  text: string
  node?: NodeId
}

export interface Language {
  id: string
  label: string
  /** the debugger this language is driven through */
  debugger: string
  lines: CodeLine[]
}

const line = (text: string, node?: NodeId): CodeLine => ({ text, node })

const bracesBody = (indent: string, mid: string): CodeLine[] => [
  line(`${indent}${indent}${mid}`, 'mid'),
  line(`${indent}${indent}if (arr[mid] == target) {`, 'equal'),
  line(`${indent}${indent}${indent}return mid;`, 'found'),
  line(`${indent}${indent}} else if (arr[mid] < target) {`, 'less'),
  line(`${indent}${indent}${indent}lo = mid + 1;`, 'right'),
  line(`${indent}${indent}} else {`),
  line(`${indent}${indent}${indent}hi = mid - 1;`, 'left'),
  line(`${indent}${indent}}`),
  line(`${indent}}`),
  line(`${indent}return -1;`, 'missing'),
  line('}'),
]

export const LANGUAGES: Language[] = [
  {
    id: 'python',
    label: 'Python',
    debugger: 'bdb',
    lines: [
      line('def binary_search(arr, target):'),
      line('    lo, hi = 0, len(arr) - 1', 'init'),
      line('    while lo <= hi:', 'loop'),
      line('        mid = (lo + hi) // 2', 'mid'),
      line('        if arr[mid] == target:', 'equal'),
      line('            return mid', 'found'),
      line('        elif arr[mid] < target:', 'less'),
      line('            lo = mid + 1', 'right'),
      line('        else:'),
      line('            hi = mid - 1', 'left'),
      line('    return -1', 'missing'),
    ],
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    debugger: 'Inspector',
    lines: [
      line('function binarySearch(arr, target) {'),
      line('  let lo = 0, hi = arr.length - 1;', 'init'),
      line('  while (lo <= hi) {', 'loop'),
      line('    const mid = Math.floor((lo + hi) / 2);', 'mid'),
      line('    if (arr[mid] === target) {', 'equal'),
      line('      return mid;', 'found'),
      line('    } else if (arr[mid] < target) {', 'less'),
      line('      lo = mid + 1;', 'right'),
      line('    } else {'),
      line('      hi = mid - 1;', 'left'),
      line('    }'),
      line('  }'),
      line('  return -1;', 'missing'),
      line('}'),
    ],
  },
  {
    id: 'java',
    label: 'Java',
    debugger: 'jdb',
    lines: [
      line('static int binarySearch(int[] arr, int target) {'),
      line('    int lo = 0, hi = arr.length - 1;', 'init'),
      line('    while (lo <= hi) {', 'loop'),
      ...bracesBody('    ', 'int mid = lo + (hi - lo) / 2;'),
    ],
  },
  {
    id: 'cpp',
    label: 'C++',
    debugger: 'gdb',
    lines: [
      line('int binarySearch(const vector<int>& arr, int target) {'),
      line('    int lo = 0, hi = arr.size() - 1;', 'init'),
      line('    while (lo <= hi) {', 'loop'),
      ...bracesBody('    ', 'int mid = lo + (hi - lo) / 2;'),
    ],
  },
  {
    id: 'go',
    label: 'Go',
    debugger: 'Delve',
    lines: [
      line('func binarySearch(arr []int, target int) int {'),
      line('\tlo, hi := 0, len(arr)-1', 'init'),
      line('\tfor lo <= hi {', 'loop'),
      line('\t\tmid := lo + (hi-lo)/2', 'mid'),
      line('\t\tif arr[mid] == target {', 'equal'),
      line('\t\t\treturn mid', 'found'),
      line('\t\t} else if arr[mid] < target {', 'less'),
      line('\t\t\tlo = mid + 1', 'right'),
      line('\t\t} else {'),
      line('\t\t\thi = mid - 1', 'left'),
      line('\t\t}'),
      line('\t}'),
      line('\treturn -1', 'missing'),
      line('}'),
    ],
  },
]

export const ARRAY = [2, 5, 8, 12, 16, 23, 38, 56]
export const TARGET = 23

/** Lines where a breakpoint is worth setting. The real tool scores these with a model. */
export const SUGGESTED: NodeId[] = ['loop', 'equal']

export interface Step {
  node: NodeId
  lo: number
  hi: number
  mid: number | null
  note: string
}

/** The run of binary_search(ARRAY, TARGET), one statement at a time. */
export const TRACE: Step[] = [
  { node: 'init', lo: 0, hi: 7, mid: null, note: 'Start with the whole array.' },
  { node: 'loop', lo: 0, hi: 7, mid: null, note: 'lo is not past hi, so keep looking.' },
  { node: 'mid', lo: 0, hi: 7, mid: 3, note: 'Look at the middle.' },
  { node: 'equal', lo: 0, hi: 7, mid: 3, note: '12 is not 23.' },
  { node: 'less', lo: 0, hi: 7, mid: 3, note: '12 is less than 23, so the answer is to the right.' },
  { node: 'right', lo: 4, hi: 7, mid: 3, note: 'Drop the left half.' },
  { node: 'loop', lo: 4, hi: 7, mid: null, note: 'Still something to search.' },
  { node: 'mid', lo: 4, hi: 7, mid: 5, note: 'Look at the new middle.' },
  { node: 'equal', lo: 4, hi: 7, mid: 5, note: '23 is 23.' },
  { node: 'found', lo: 4, hi: 7, mid: 5, note: 'Found 23 at index 5.' },
]

/** The control-flow graph of the program, laid out on a 300 by 350 canvas. */
export const GRAPH: { id: NodeId; label: string; x: number; y: number; test?: boolean }[] = [
  { id: 'init', label: 'lo, hi', x: 160, y: 24 },
  { id: 'loop', label: 'lo ≤ hi ?', x: 160, y: 80, test: true },
  { id: 'missing', label: 'return -1', x: 52, y: 80 },
  { id: 'mid', label: 'mid', x: 160, y: 136 },
  { id: 'equal', label: '= target ?', x: 160, y: 192, test: true },
  { id: 'found', label: 'return mid', x: 52, y: 192 },
  { id: 'less', label: '< target ?', x: 160, y: 248, test: true },
  { id: 'right', label: 'lo = mid + 1', x: 100, y: 310 },
  { id: 'left', label: 'hi = mid - 1', x: 222, y: 310 },
]

/** Edges as SVG paths. The last one is the loop's way back to the test. */
export const EDGES: { d: string; back?: boolean }[] = [
  { d: 'M160 39 V65' },
  { d: 'M118 80 H94' },
  { d: 'M160 95 V121' },
  { d: 'M160 151 V177' },
  { d: 'M118 192 H94' },
  { d: 'M160 207 V233' },
  { d: 'M140 263 L104 295' },
  { d: 'M180 263 L218 295' },
  { d: 'M100 325 V340 H288 V80 H202', back: true },
  { d: 'M222 325 V340', back: true },
]

/** Decision points plus one. */
export const COMPLEXITY = GRAPH.filter((node) => node.test).length + 1

export const PIPELINE = [
  { name: 'Detect', text: 'Regex fingerprints name the language, or decline to guess.' },
  { name: 'Sandbox', text: 'Each language runs in its own Docker container.' },
  { name: 'Debug', text: 'One JSON protocol in front of bdb, gdb, jdb, the JS Inspector and Delve.' },
  { name: 'Graph', text: 'A control-flow graph with cyclomatic complexity.' },
  { name: 'Suggest', text: 'Random Forest models pick lines worth a breakpoint.' },
  { name: 'Translate', text: 'Gemini rewrites the code, anchored by that graph.' },
]
