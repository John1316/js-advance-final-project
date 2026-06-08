class CacheService {
  #cache = new Map()

  get(key) {
    const entry = this.#cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.#cache.delete(key)
      return null
    }
    return entry.value
  }

  set(key, value, ttlMs = 5 * 60 * 1000) {
    this.#cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  has(key) {
    return this.get(key) !== null
  }
}

export const apiCache = new CacheService()
