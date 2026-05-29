let ctx: AudioContext | null = null
const activeNodes: AudioNode[] = []
let masterGain: GainNode | null = null

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.5
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === "suspended") {
    ctx.resume()
  }
  return ctx
}

function noiseBuffer(ctx: AudioContext, duration: number, type: "white" | "pink" | "brown" | "rain"): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else if (type === "pink") {
    const b = [0, 0, 0, 0, 0, 0, 0]
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b[0] = 0.99886 * b[0] + white * 0.0555179
      b[1] = 0.99332 * b[1] + white * 0.0750759
      b[2] = 0.969 * b[2] + white * 0.153852
      b[3] = 0.8665 * b[3] + white * 0.3104856
      b[4] = 0.55 * b[4] + white * 0.5329522
      b[5] = -0.7616 * b[5] - white * 0.016898
      data[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + white * 0.5362) * 0.11
      b[6] = white * 0.115926
    }
  } else if (type === "brown") {
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
  } else if (type === "rain") {
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      const envelope = 0.5 + 0.5 * Math.sin((i / sampleRate) * 4 * Math.PI * 2)
      data[i] = white * 0.3 * envelope
    }
    // low-pass smoothing
    let prev = 0
    for (let i = 0; i < length; i++) {
      prev = prev * 0.8 + data[i] * 0.2
      data[i] = prev
    }
  }

  return buffer
}

function playType(type: "white" | "pink" | "brown" | "rain"): () => void {
  const c = getCtx()
  const duration = 60
  const source = c.createBufferSource()
  source.buffer = noiseBuffer(c, duration, type)
  source.loop = true
  const gain = c.createGain()
  gain.gain.value = 1
  source.connect(gain)
  if (masterGain) {
    gain.connect(masterGain)
  }
  source.start()
  const node = source
  activeNodes.push(node)
  activeNodes.push(gain)
  return () => {
    try { source.stop() } catch {}
    const idx = activeNodes.indexOf(node)
    if (idx >= 0) activeNodes.splice(idx, 1)
    const gIdx = activeNodes.indexOf(gain)
    if (gIdx >= 0) activeNodes.splice(gIdx, 1)
  }
}

export function playWhiteNoise(): () => void {
  return playType("white")
}
export function playPinkNoise(): () => void {
  return playType("pink")
}
export function playBrownNoise(): () => void {
  return playType("brown")
}
export function playRain(): () => void {
  return playType("rain")
}

export function stopAllSounds() {
  for (const node of activeNodes) {
    try { if (node instanceof AudioScheduledSourceNode) node.stop() } catch {}
  }
  activeNodes.length = 0
}

export function setMasterVolume(v: number) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v))
  }
}
