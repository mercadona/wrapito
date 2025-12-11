import {
  fetch as ponyfillFetch,
  Headers as PonyHeaders,
  Request as PonyRequest,
  Response as PonyResponse,
} from 'whatwg-fetch'

// Ensure window.fetch exists so the spy below doesn't wrap undefined (CI/jsdom can lack it or other tests may reset it)
export const ensureWindowFetch = () => {
  if (typeof global.window === 'undefined') return

  if (typeof global.window.fetch !== 'function') {
    const candidate =
      typeof globalThis.fetch === 'function' ? globalThis.fetch : ponyfillFetch

    if (candidate) {
      // @ts-ignore
      global.window.fetch = candidate.bind(globalThis)
    }
  }

  if (!global.window.Request && PonyRequest) {
    global.window.Request = PonyRequest
  }
  if (!global.window.Response && PonyResponse) {
    global.window.Response = PonyResponse
  }
  if (!global.window.Headers && PonyHeaders) {
    global.window.Headers = PonyHeaders
  }
}