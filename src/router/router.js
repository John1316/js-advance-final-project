import { ROUTES } from '../utils/constants.js'

export class Router {
  #routes = new Map()
  #notFound = null
  #root = null

  constructor(root) {
    this.#root = root
    window.addEventListener('popstate', () => this.#resolve())
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-link]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('http')) return

      event.preventDefault()
      this.navigate(href)
    })
  }

  register(path, handler) {
    this.#routes.set(path, handler)
    return this
  }

  onNotFound(handler) {
    this.#notFound = handler
    return this
  }

  navigate(path) {
    history.pushState({}, '', path)
    this.#resolve()
  }

  start() {
    if (location.pathname === '/') {
      this.navigate(ROUTES.SEARCH)
      return
    }
    this.#resolve()
  }

  #resolve() {
    const path = location.pathname
    const handler = this.#routes.get(path) ?? this.#notFound
    handler?.(this.#root)
  }
}
