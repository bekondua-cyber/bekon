const store = new Map<string, { count: number; resetAt: number }>()

const CLEANUP_INTERVAL = 5 * 60 * 1000

let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  store.forEach((val, key) => {
    if (now > val.resetAt) store.delete(key)
  })
}

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup()

  const now = Date.now()
  const existing = store.get(identifier)

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count++
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  }
}
