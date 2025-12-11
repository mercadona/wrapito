import { fetch, Request, Response, Headers } from 'whatwg-fetch'

// Ensure jsdom's window has a fetch implementation before wrapito spies on it.
global.fetch = global.fetch || fetch
global.window.fetch = global.window.fetch || global.fetch
global.Request = Request
global.Response = Response
global.Headers = Headers
