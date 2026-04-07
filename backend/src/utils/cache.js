class TimedCache {
  constructor(ttlMs) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() - item.cachedAt > this.ttlMs) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value) {
    this.store.set(key, {
      cachedAt: Date.now(),
      value
    });
  }

  clear() {
    this.store.clear();
  }
}

module.exports = {
  TimedCache
};
