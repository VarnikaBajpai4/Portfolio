// Chindi's voice for `catsay`: the text is spoken in meows. Each syllable becomes one short meow, made with the
// Web Audio API, so it sounds like a cat that talks and not like a person. The vowel of a syllable sets the
// sound of its meow, and a question goes up at the end. Under the meows, the browser's speech voice says the
// words quietly at its highest pitch, so that a listener can just make them out.

let audio: AudioContext | null = null

/** the most syllables one line is spoken with, so that a long line does not go on and on */
const MOST_SYLLABLES = 24
/** where the band-pass filter sits for each vowel: the "mee", "maa", "moo" of a meow */
const FORMANTS: Record<string, number> = { a: 1500, e: 2200, i: 2600, o: 1100, u: 900, y: 2400 }
const BASE_HZ = 620
/** how loud the words under the meows are, from 0 to 1: enough to follow, not enough to sound like a person */
const WORDS_VOLUME = 0.3
/** voices that sound light, in order of preference; the first one that the browser has is used */
const VOICE_NAMES = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google UK English Female', 'Microsoft Zira', 'Victoria']

function context(): AudioContext | null {
  const Audio = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Audio) return null
  audio ??= new Audio()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

interface Syllable {
  vowel: string
  /** letters in the syllable, for its length */
  size: number
  /** 1 is her normal pitch */
  pitch: number
  loud: boolean
  /** a word ends after it */
  last: boolean
}

/** Split the text into syllables: a run of consonants and the vowels after it. Numbers count as one syllable. */
function syllables(text: string): Syllable[] {
  const out: Syllable[] = []
  for (const word of text.toLowerCase().match(/[a-z0-9']+/g) ?? []) {
    const parts = word.match(/[^aeiouy]*[aeiouy]+|[^aeiouy]+$/g) ?? [word]
    parts.forEach((part, i) => {
      const vowel = part.match(/[aeiouy]/)?.[0] ?? 'a'
      // a small step up or down from the letters, so the same word always sounds the same
      const step = ([...part].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 7) - 3
      out.push({ vowel, size: part.length, pitch: 1 + step * 0.06, loud: false, last: i === parts.length - 1 })
    })
  }
  const end = out[out.length - 1]
  if (end && /\?\s*$/.test(text)) end.pitch *= 1.3
  if (end && /!\s*$/.test(text)) {
    end.pitch *= 1.15
    end.loud = true
  }
  return out.slice(0, MOST_SYLLABLES)
}

/** One short meow at `start` seconds on the audio clock. */
function meow(ctx: AudioContext, start: number, length: number, syllable: Syllable): void {
  const end = start + length
  const hz = BASE_HZ * syllable.pitch
  const formant = FORMANTS[syllable.vowel] ?? 1800

  // the tone rises and then falls a little, as a meow does
  const tone = ctx.createOscillator()
  tone.type = 'sawtooth'
  tone.frequency.setValueAtTime(hz * 0.85, start)
  tone.frequency.linearRampToValueAtTime(hz * 1.15, start + length * 0.3)
  tone.frequency.exponentialRampToValueAtTime(hz * 0.95, end)

  // a quick wobble, so that it does not sound like a machine
  const wobble = ctx.createOscillator()
  const depth = ctx.createGain()
  wobble.frequency.value = 9
  depth.gain.value = hz * 0.03
  wobble.connect(depth).connect(tone.frequency)

  // the filter opens and closes: "m-ee-ow" in one short sound
  const vowel = ctx.createBiquadFilter()
  vowel.type = 'bandpass'
  vowel.Q.value = 3
  vowel.frequency.setValueAtTime(formant * 0.6, start)
  vowel.frequency.linearRampToValueAtTime(formant, start + length * 0.3)
  vowel.frequency.linearRampToValueAtTime(formant * 0.75, end)

  const peak = syllable.loud ? 0.34 : 0.24
  const volume = ctx.createGain()
  volume.gain.setValueAtTime(0.0001, start)
  volume.gain.exponentialRampToValueAtTime(peak, start + 0.02)
  volume.gain.setValueAtTime(peak, start + length * 0.55)
  volume.gain.exponentialRampToValueAtTime(0.0001, end)

  tone.connect(vowel).connect(volume).connect(ctx.destination)
  tone.start(start)
  wobble.start(start)
  tone.stop(end + 0.05)
  wobble.stop(end + 0.05)
}

function lightVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en'))
  for (const name of VOICE_NAMES) {
    const voice = voices.find((v) => v.name.includes(name))
    if (voice) return voice
  }
  return voices[0] ?? null
}

/** The words, quiet and very high, at the same time as the meows. */
function whisper(text: string): void {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const words = new SpeechSynthesisUtterance(text)
  words.voice = lightVoice()
  words.pitch = 2
  words.rate = 1
  words.volume = WORDS_VOLUME
  window.speechSynthesis.speak(words)
}

/** Say the text the way Chindi would: in meows, one for each syllable, with the words faint underneath. */
export function speakAsCat(text: string): void {
  whisper(text)
  const ctx = context()
  if (!ctx) return
  let at = ctx.currentTime + 0.03
  for (const syllable of syllables(text)) {
    const length = 0.12 + 0.02 * Math.min(syllable.size, 4)
    meow(ctx, at, length, syllable)
    // a small gap inside a word, a larger one between words
    at += length + (syllable.last ? 0.08 : 0.025)
  }
}
