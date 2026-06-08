"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { speakText, stopSpeaking, getVoiceSettings } from "@/lib/voice"

interface UseJarvisVoiceReturn {
  speaking: boolean
  paused: boolean
  speakingMessageId: string | null
  autoRead: boolean
  setAutoRead: (v: boolean) => void
  speakMessage: (messageId: string, text: string) => void
  stopVoice: () => void
  pauseVoice: () => void
  resumeVoice: () => void
}

export function useJarvisVoice(): UseJarvisVoiceReturn {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [autoRead, setAutoReadState] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("lifeos-jarvis-autoread") === "true"
  })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Restore settings from localStorage
  useEffect(() => {
    const val = localStorage.getItem("lifeos-jarvis-autoread")
    if (val !== null) setAutoReadState(val === "true")
  }, [])

  const setAutoRead = useCallback((v: boolean) => {
    setAutoReadState(v)
    localStorage.setItem("lifeos-jarvis-autoread", v ? "true" : "false")
  }, [])

  const sanitize = useCallback((text: string) =>
    text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/gi, "link")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/^---+\s*$/gm, "")
      .replace(/^>\s*/gm, "")
      .replace(/[|]:?-+:?/g, "")
      .replace(/^\|/gm, "").replace(/\|$/gm, "")
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ +/g, " ").trim(),
  [])

  const speakMessage = useCallback((messageId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const settings = getVoiceSettings()
    const clean = sanitize(text)
    if (!clean) return

    // Split into sentences for natural reading
    const paragraphs = clean.split(/\n\n+/)
    const sentences: string[] = []
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim()
      if (!para) continue
      // Split on sentence boundaries (. ! ? followed by space or end)
      const parts = para.split(/(?<=[.!?])\s+/)
      sentences.push(...parts)
      // Add a short pause after each paragraph (except the last)
      if (i < paragraphs.length - 1) sentences.push("...")
    }

    if (sentences.length === 0) return
    let idx = 0
    const speakNext = () => {
      if (idx >= sentences.length) {
        setSpeaking(false)
        setSpeakingMessageId(null)
        utteranceRef.current = null
        return
      }
      const chunk = sentences[idx++]
      if (!chunk) { speakNext(); return }
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.rate = settings.rate || 1.0
      utterance.pitch = settings.pitch || 1.0
      utterance.volume = settings.volume || 0.9
      if (settings.voiceName) {
        const voices = window.speechSynthesis.getVoices()
        const match = voices.find(v => v.name === settings.voiceName)
        if (match) utterance.voice = match
      }
      utteranceRef.current = utterance
      utterance.onend = speakNext
      utterance.onerror = speakNext
      window.speechSynthesis.speak(utterance)
    }

    setSpeaking(true)
    setPaused(false)
    setSpeakingMessageId(messageId)
    speakNext()
  }, [sanitize])

  const stopVoice = useCallback(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
    setPaused(false)
    setSpeakingMessageId(null)
    utteranceRef.current = null
  }, [])

  const pauseVoice = useCallback(() => {
    window.speechSynthesis?.pause()
    setPaused(true)
  }, [])

  const resumeVoice = useCallback(() => {
    window.speechSynthesis?.resume()
    setPaused(false)
  }, [])

  return { speaking, paused, speakingMessageId, autoRead, setAutoRead, speakMessage, stopVoice, pauseVoice, resumeVoice }
}
