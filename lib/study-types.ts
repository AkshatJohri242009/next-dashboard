export interface StudyTask {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface ExamDate {
  id: string
  title: string
  date: string
  createdAt: number
}

export interface StudyFile {
  id: string
  name: string
  size: number
  type: string
  data: string // base64
  createdAt: number
}

export interface Airport {
  code: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
}

export interface StudyScore {
  id: string
  type: "test" | "mock"
  subject: string
  score: number
  total: number
  date: string
  createdAt: number
}

export interface StudyError {
  id: string
  subject: string
  topic: string
  description: string
  date: string
  createdAt: number
}
