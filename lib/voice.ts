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
      body: JSON.stringify({ text, provider, voice: voiceName }),
    }).then(res => { if (!res.ok) throw new Error("TTS failed") })
  }
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) return reject(new Error("Speech synthesis not supported"))
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = DEFAULT_CONFIG.speed
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices()
      const match = voices.find(v => v.name === voiceName)
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
