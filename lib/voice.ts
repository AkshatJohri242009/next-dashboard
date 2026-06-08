"use client"

type STTProviderName = "webspeech" | "whisper" | "deepgram"
type TTSProviderName = "webspeech" | "elevenlabs" | "openai"

export interface VoiceConfig {
  sttProvider: STTProviderName
  ttsProvider: TTSProviderName
  wakeWord: string
  voice: string
  speed: number
}

const DEFAULT_CONFIG: VoiceConfig = {
  sttProvider: "webspeech",
  ttsProvider: "webspeech",
  wakeWord: "Jarvis",
  voice: "",
  speed: 1,
}

let recognition: any = null
let wakeWordTimeout: ReturnType<typeof setTimeout> | null = null
let onWakeCallback: (() => void) | null = null

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
}

export function isSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

export function startWakeWordDetection(callback: () => void, config: Partial<VoiceConfig> = {}) {
  if (!isSpeechSupported()) return
  const wakeWord = config.wakeWord || DEFAULT_CONFIG.wakeWord
  onWakeCallback = callback
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  recognition = new SpeechRecognitionAPI()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = "en-US"

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript.toLowerCase()
      if (transcript.includes(wakeWord.toLowerCase())) {
        if (onWakeCallback) onWakeCallback()
      }
    }
  }
  recognition.onerror = () => {
    if (wakeWordTimeout) clearTimeout(wakeWordTimeout)
    wakeWordTimeout = setTimeout(() => startWakeWordDetection(callback, config), 3000)
  }
  try { recognition.start() } catch {}
}

export function stopWakeWordDetection() {
  if (recognition) {
    try { recognition.stop() } catch {}
    recognition = null
  }
  if (wakeWordTimeout) clearTimeout(wakeWordTimeout)
  onWakeCallback = null
}

export async function transcribeAudio(audioBlob: Blob, provider: STTProviderName = "webspeech"): Promise<string> {
  if (provider === "whisper" || provider === "deepgram") {
    const formData = new FormData()
    formData.append("audio", audioBlob)
    const ep = provider === "whisper" ? "/api/jarvis/voice/whisper" : "/api/jarvis/voice/deepgram"
    const res = await fetch(ep, { method: "POST", body: formData })
    if (!res.ok) throw new Error(`STT failed: ${res.statusText}`)
    const data = await res.json()
    return data.text || ""
  }
  return new Promise((resolve, reject) => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return reject(new Error("Speech recognition not supported"))
    const sr = new SpeechRecognitionAPI()
    sr.continuous = false
    sr.interimResults = false
    sr.lang = "en-US"
    sr.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      resolve(text)
    }
    sr.onerror = () => reject(new Error("Speech recognition failed"))
    sr.start()
  })
}

export function speakText(text: string, provider: TTSProviderName = "webspeech", voiceName = ""): Promise<void> {
  if (provider !== "webspeech") {
    return fetch("/api/jarvis/voice/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sanitizeTextForSpeech(text), provider, voice: voiceName }),
    }).then(res => { if (!res.ok) throw new Error("TTS failed") })
  }
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) return reject(new Error("Speech synthesis not supported"))
    window.speechSynthesis.cancel()
    const clean = sanitizeTextForSpeech(text)
    const utterance = new SpeechSynthesisUtterance(clean)
    const settings = getVoiceSettings()
    utterance.rate = settings.rate || 1.0
    utterance.pitch = settings.pitch || 1.0
    utterance.volume = settings.volume || 0.9
    const voice = voiceName || settings.voiceName
    if (voice) {
      const voices = window.speechSynthesis.getVoices()
      const match = voices.find(v => v.name === voice)
      if (match) utterance.voice = match
    }
    utterance.onend = () => resolve()
    utterance.onerror = () => reject(new Error("Speech synthesis failed"))
    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!window.speechSynthesis) return []
  return window.speechSynthesis.getVoices()
}

export async function startListening(timeoutMs = 10000): Promise<string> {
  if (!isSpeechSupported()) throw new Error("Speech recognition not supported")
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const sr = new SpeechRecognitionAPI()
  sr.continuous = false
  sr.interimResults = false
  sr.lang = "en-US"

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { sr.stop(); reject(new Error("Listening timed out")) }, timeoutMs)
    sr.onresult = (event: SpeechRecognitionEvent) => {
      clearTimeout(timer)
      resolve(event.results[0][0].transcript)
    }
    sr.onerror = () => { clearTimeout(timer); reject(new Error("Speech recognition error")) }
    sr.onend = () => clearTimeout(timer)
    try { sr.start() } catch { clearTimeout(timer); reject(new Error("Failed to start listening")) }
  })
}

/** Interim speech recognition — fires onResult with live transcript, ends on silence */
export function startListeningInterim(
  onResult: (transcript: string, isFinal: boolean) => void,
  onEnd: (finalTranscript: string) => void,
  onError?: (error: string) => void,
  lang = "en-US",
  continuous = false,
): () => void {
  if (!isSpeechSupported()) {
    onError?.("Speech recognition not supported")
    return () => {}
  }
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const sr = new SpeechRecognitionAPI()
  sr.continuous = continuous
  sr.interimResults = true
  sr.lang = lang

  let finalTranscript = ""

  sr.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript
      const isFinal = event.results[i].isFinal
      if (isFinal) finalTranscript = text
      onResult(text, isFinal)
    }
  }
  sr.onerror = () => onError?.("Speech recognition error")
  sr.onend = () => onEnd(finalTranscript)
  try { sr.start() } catch { onError?.("Failed to start listening") }

  return () => { try { sr.stop() } catch {} }
}

/**
 * Strips markdown syntax and URLs from text before passing to speech synthesis.
 * Converts: # → removed, **bold** → bold, * → pause, `code` → code, > → removed,
 * ``` fences → removed, tables → prose, URLs → "link"
 */
export function sanitizeTextForSpeech(text: string): string {
  return text
    // Remove code fences and their content (too technical to read aloud)
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove image/link references but keep alt text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Replace URLs with "link"
    .replace(/https?:\/\/\S+/gi, "link")
    // Remove heading markers
    .replace(/^#{1,6}\s*/gm, "")
    // Remove bold/italic markers
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove horizontal rules
    .replace(/^---+\s*$/gm, "")
    // Remove blockquote markers
    .replace(/^>\s*/gm, "")
    // Remove table pipes and dividers
    .replace(/[|]:?-+:?/g, "")
    .replace(/^\|/gm, "")
    .replace(/\|$/gm, "")
    // Convert bullet points to commas
    .replace(/^[\s]*[-*+]\s+/gm, "")
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +/g, " ")
    .trim()
}

/** Reads voice settings from localStorage with defaults */
export function getVoiceSettings() {
  if (typeof window === "undefined") return {}
  return {
    voiceName: localStorage.getItem("lifeos-jarvis-voice") || "",
    rate: parseFloat(localStorage.getItem("lifeos-jarvis-rate") || "1.0"),
    pitch: parseFloat(localStorage.getItem("lifeos-jarvis-pitch") || "1.0"),
    volume: parseFloat(localStorage.getItem("lifeos-jarvis-volume") || "0.9"),
  }
}
