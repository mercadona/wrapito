const defaultHeaders = () => {
  if (typeof Headers === 'undefined') {
    return {
      get: () => null,
      has: () => false,
    }
  }

  return new Headers({ 'Content-Type': 'application/json' })
}

export const createDefaultFetchResponse = () => {
  return {
    json: () => Promise.resolve(),
    status: 200,
    ok: true,
    headers: defaultHeaders(),
  }
}
