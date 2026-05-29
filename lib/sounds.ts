let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
const activeSources: AudioBufferSourceNode[] = []

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
      masterGain = ctx.createGain()
      masterGain.gain.value = 0.5
      masterGain.connect(ctx.destination)
    }
    if (ctx.state === "suspended") {
      ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

function noiseBuffer(ctx: AudioContext, type: "white" | "pink" | "brown" | "rain"): AudioBuffer {
  const duration = 3
  const sampleRate = ctx.sampleRate
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else if (type === "pink") {
    const b = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1
      b[0] = 0.99886 * b[0] + w * 0.0555179
      b[1] = 0.99332 * b[1] + w * 0.0750759
      b[2] = 0.969 * b[2] + w * 0.153852
      b[3] = 0.8665 * b[3] + w * 0.3104856
      b[4] = 0.55 * b[4] + w * 0.5329522
      b[5] = -0.7616 * b[5] - w * 0.016898
      data[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + w * 0.5362) * 0.11
      b[6] = w * 0.115926
    }
  } else if (type === "brown") {
    let last = 0
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      data[i] = last * 3.5
    }
    const fadeSamples = Math.min(Math.floor(sampleRate * 0.05), length)
    const startVal = data[0]
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples
      data[length - 1 - i] = data[length - 1 - i] * (1 - t) + startVal * t
    }
  } else if (type === "rain") {
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1
      const envelope = 0.5 + 0.5 * Math.sin((i / sampleRate) * 8 * Math.PI)
      data[i] = w * 0.3 * envelope
    }
    let prev = 0
    for (let i = 0; i < length; i++) {
      prev = prev * 0.8 + data[i] * 0.2
      data[i] = prev
    }
  }

  return buffer
}

function playType(type: "white" | "pink" | "brown" | "rain"): (() => void) | null {
  const c = getCtx()
  if (!c) return null
  const source = c.createBufferSource()
  source.buffer = noiseBuffer(c, type)
  source.loop = true
  const gain = c.createGain()
  gain.gain.value = 1
  source.connect(gain)
  if (masterGain) {
    gain.connect(masterGain)
  }
  source.start()
  activeSources.push(source)
  return () => {
    try { source.stop() } catch {}
    const idx = activeSources.indexOf(source)
    if (idx >= 0) activeSources.splice(idx, 1)
  }
}

export function playWhiteNoise(): (() => void) | null {
  return playType("white")
}
export function playPinkNoise(): (() => void) | null {
  return playType("pink")
}
export function playBrownNoise(): (() => void) | null {
  return playType("brown")
}
export function playRain(): (() => void) | null {
  return playType("rain")
}

export function stopAllSounds() {
  for (const s of activeSources) {
    try { s.stop() } catch {}
  }
  activeSources.length = 0
}

export function setMasterVolume(v: number) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v))
  }
}
