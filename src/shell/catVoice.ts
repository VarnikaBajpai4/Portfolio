// Chindi's voice for `catsay`: a short meow made with the Web Audio API, then the words in a high,
// quick voice from the browser's own speech synthesis, and a small "mrrp" at the end.
// Each part is skipped when the browser does not have it.

let audio: AudioContext | null = null

/** voices that sound light and friendly, in order of preference; the first one that the browser has is used */
const VOICE_NAMES = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google UK English Female', 'Microsoft Zira', 'Victoria']

function context(): AudioContext | null {
  const Audio = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Audio) return null
  audio ??= new Audio()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

/**
 * One meow. A cat's meow is a tone that rises and then falls, with a "mee" that opens into an "ow":
 * a sawtooth wave makes the tone, and a band-pass filter that moves with it makes the vowel.
 */
function meow(length = 0.42, pitch = 1): void {
  const ctx = context()
  if (!ctx) return
  const start = ctx.currentTime + 0.02
  const end = start + length

  const tone = ctx.createOscillator()
  tone.type = 'sawtooth'
  tone.frequency.setValueAtTime(430 * pitch, start)
  tone.frequency.linearRampToValueAtTime(860 * pitch, start + length * 0.3)
  tone.frequency.exponentialRampToValueAtTime(520 * pitch, end)

  // a small, quick wobble, so that it does not sound like a machine
  const wobble = ctx.createOscillator()
  const depth = ctx.createGain()
  wobble.frequency.value = 7
  depth.gain.value = 14 * pitch
  wobble.connect(depth).connect(tone.frequency)

  const vowel = ctx.createBiquadFilter()
  vowel.type = 'bandpass'
  vowel.Q.value = 3
  vowel.frequency.setValueAtTime(900, start)
  vowel.frequency.linearRampToValueAtTime(2300, start + length * 0.3)
  vowel.frequency.linearRampToValueAtTime(1100, end)

  const volume = ctx.createGain()
  volume.gain.setValueAtTime(0.0001, start)
  volume.gain.exponentialRampToValueAtTime(0.28, start + 0.03)
  volume.gain.setValueAtTime(0.28, start + length * 0.6)
  volume.gain.exponentialRampToValueAtTime(0.0001, end)

  tone.connect(vowel).connect(volume).connect(ctx.destination)
  tone.start(start)
  wobble.start(start)
  tone.stop(end + 0.05)
  wobble.stop(end + 0.05)
}

function catVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('en'))
  for (const name of VOICE_NAMES) {
    const voice = voices.find((v) => v.name.includes(name))
    if (voice) return voice
  }
  return voices[0] ?? null
}

/** Meow, say the text in a cat's voice, and finish with a little "mrrp". */
export function speakAsCat(text: string): void {
  meow()
  if (!('speechSynthesis' in window)) return
  const speech = window.speechSynthesis
  speech.cancel()
  const words = new SpeechSynthesisUtterance(text)
  words.voice = catVoice()
  // as high as a browser voice goes, and a little quick: a small animal, not a person
  words.pitch = 2
  words.rate = 1.12
  words.volume = 0.9
  words.onend = () => meow(0.22, 1.35)
  window.setTimeout(() => speech.speak(words), 480)
}
