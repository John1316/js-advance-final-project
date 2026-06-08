export function debounce(fn, delay = 300) {
  let timerId = null

  return (...args) => {
    clearTimeout(timerId)
    timerId = setTimeout(() => fn(...args), delay)
  }
}
