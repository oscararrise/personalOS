export type Task = { id: number; title: string; category: Category; done: boolean; due_date: string | null; created_at: string }
export type Category = 'urgente' | 'importante' | 'hogar' | 'algun_dia'
export type Note = { id: number; title: string; content: string; created_at: string }
export type Habit = { id: number; title: string; created_at: string }
export type HabitEntry = { id: number; habit: number; date: string; completed: boolean }
export type Session = { authenticated: boolean; username: string }
function getCookie(key: string): string {
  return document.cookie.split('; ').find(value => value.startsWith(key + '='))?.split('=').slice(1).join('=') ?? ''
}
export async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch('/api/' + path, {
    method, credentials: 'same-origin',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(method !== 'GET' ? { 'X-CSRFToken': decodeURIComponent(getCookie('csrftoken')) } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null)
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : ('Error HTTP ' + res.status)
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
export async function initializeSession(): Promise<Session | null> {
  await request('auth/csrf/')
  try { return await request<Session>('auth/me/') } catch { return null }
}
