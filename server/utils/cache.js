/**
 * High-performance in-memory TTL cache for Fordoportro server
 * Optimizes response time for Products, Categories, and Stats
 */

class MemoryCache {
  constructor(defaultTTL = 60 * 1000) { // default 60 seconds
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key) {
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return record.data;
  }

  set(key, data, ttl = this.defaultTTL) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }

  del(key) {
    this.store.delete(key);
  }

  clearPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  flush() {
    this.store.clear();
  }

  stats() {
    return {
      keysCount: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

const cacheInstance = new MemoryCache();

module.exports = cacheInstance;
