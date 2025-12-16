import deepEqual from 'deep-equal'
import { http, HttpResponse } from 'msw'
import { setupServer, SetupServer } from 'msw/node'

type MockDefinition = {
  method: string
  url: string
  requestBody?: unknown
  responseBody?: unknown
  status?: number
  headers?: Record<string, string>
}

const parseBody = async (request: Request) => {
  const raw = await request.text()
  if (!raw) return undefined

  try {
    return JSON.parse(raw)
  } catch (e) {
    return raw
  }
}

const buildHandler = (mock: MockDefinition) => {
  const method = mock.method?.toLowerCase() ?? 'all'
  const builder = (http as unknown as Record<string, any>)[method] ?? http.all

  return builder(mock.url, async ({ request }) => {
    if (mock.requestBody !== undefined) {
      const receivedBody = await parseBody(request)
      const matches = deepEqual(receivedBody, mock.requestBody)

      if (!matches) {
        return HttpResponse.json(null, { status: 404 })
      }
    }

    return HttpResponse.json(mock.responseBody ?? null, {
      status: mock.status ?? 200,
      headers: mock.headers ? new Headers(mock.headers) : undefined,
    })
  })
}

const mockRequestsWithMSW = (definitions: MockDefinition[]) => {
  const handlers = definitions.map(buildHandler)
  const server: SetupServer = setupServer(...handlers)

  server.listen({ onUnhandledRequest: 'bypass' })

  const stop = () => {
    server.resetHandlers()
    server.close()
  }

  return stop
}

export { mockRequestsWithMSW, MockDefinition }
