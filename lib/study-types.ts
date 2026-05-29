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
