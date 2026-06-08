const EVENT_NAME = "lifeos-data-changed"

export type DataChangeEvent = {
  keys: string[]
  source: "jarvis" | "user" | "sync"
}

export function dispatchDataChanged(keys: string[], source: DataChangeEvent["source"] = "jarvis") {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { keys, source } }))
}

export function onDataChanged(handler: (e: DataChangeEvent) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent).detail as DataChangeEvent)
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
