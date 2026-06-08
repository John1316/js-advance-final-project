class RetryQueue {
  #queue = []

  enqueue(task) {
    this.#queue.push(task)
  }

  async drain() {
    const tasks = [...this.#queue]
    this.#queue = []

    for (const task of tasks) {
      try {
        await task()
      } catch {
        // Keep queue resilient for demo usage.
      }
    }
  }
}

export const retryQueue = new RetryQueue()
