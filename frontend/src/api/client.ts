export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Не удалось выполнить запрос (${status}).`)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, options)
  if (!response.ok) throw new ApiError(response.status)
  return response.json() as Promise<T>
}

// Only endpoints documented to return 404 for an empty collection opt in.
export async function requestList<T>(path: string, signal?: AbortSignal, emptyOn404 = false): Promise<T[]> {
  try {
    const data = await request<T[]>(path, { signal })
    if (!Array.isArray(data)) throw new Error('Сервер вернул неверный формат списка.')
    return data
  } catch (error) {
    if (emptyOn404 && error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте ещё раз.'
}
