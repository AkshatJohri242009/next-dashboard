const BASE = "/api"

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Data CRUD
  list: <T>(type: string) => request<T[]>(`/data/${type}`),
  get: <T>(type: string, id: string) => request<T>(`/data/${type}/${id}`),
  create: <T>(type: string, data: Partial<T>) =>
    request<T>(`/data/${type}`, { method: "POST", body: JSON.stringify(data) }),
  update: <T>(type: string, id: string, data: Partial<T>) =>
    request<T>(`/data/${type}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(type: string, id: string) =>
    request<T>(`/data/${type}/${id}`, { method: "DELETE" }),

  // Bulk operations
  bulkCreate: <T>(type: string, items: Partial<T>[]) =>
    request<T[]>(`/data/${type}/bulk`, { method: "POST", body: JSON.stringify(items) }),

  // Profile
  updateProfile: (data: { name?: string; image?: string }) =>
    request("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request("/user/change-password", { method: "POST", body: JSON.stringify(data) }),

  // Onboarding
  seedStarter: () => request("/onboarding/seed", { method: "POST" }),
  resetAccount: () => request("/onboarding/reset", { method: "POST" }),

  // Migration
  migrate: (data: Record<string, unknown>) =>
    request("/data/migrate", { method: "POST", body: JSON.stringify(data) }),
}
