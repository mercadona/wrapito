import { cleanup, render, screen } from '@testing-library/react'
import { configure, wrap } from '../../src/index'
import { setupLateRequestWarning } from '../../src/mockNetwork'
import { GreetingComponent } from '../components.mock'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const originalWarn = window.console.warn

beforeAll(() => (window.console.warn = vi.fn()))

afterEach(() => {
  cleanup()
})

afterAll(() => {
  window.console.warn = originalWarn
})

describe('warnOnPendingRequests', () => {
  describe('setupLateRequestWarning', () => {
    it('should log a warning with URL, method and test name when a late fetch happens', async () => {
      const consoleWarn = vi.spyOn(console, 'warn')
      configure({
        defaultHost: 'my-host',
        mount: render,
        warnOnPendingRequests: true,
      })

      wrap(GreetingComponent)
        .withNetwork([
          {
            path: '/request1',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 1 },
            responseBody: { name: 'Joe' },
          },
          {
            path: '/request2',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 2 },
            responseBody: { name: 'Sam' },
          },
        ])
        .mount()

      await screen.findByText('Hi Sam!')

      // Simulate what afterEach in wrap.tsx does
      setupLateRequestWarning('my test name')

      // Now simulate a late fetch
      const response = await window.fetch(
        new Request('my-host/late-request', { method: 'POST' }),
      )

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('late request detected after test finished:'),
      )
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('URL: my-host/late-request'),
      )
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('METHOD: post'),
      )
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('TEST: my test name'),
      )

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
      expect(response.ok).toBe(true)
      const json = await response.json()
      expect(json).toBeUndefined()
    })

    it('should not include test name when not provided', async () => {
      const consoleWarn = vi.spyOn(console, 'warn')
      configure({
        defaultHost: 'my-host',
        mount: render,
        warnOnPendingRequests: true,
      })

      wrap(GreetingComponent)
        .withNetwork([
          {
            path: '/request1',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 1 },
            responseBody: { name: 'Joe' },
          },
          {
            path: '/request2',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 2 },
            responseBody: { name: 'Sam' },
          },
        ])
        .mount()

      await screen.findByText('Hi Sam!')

      setupLateRequestWarning()

      consoleWarn.mockClear()

      await window.fetch(
        new Request('my-host/another-request', { method: 'GET' }),
      )

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('late request detected after test finished:'),
      )
      expect(consoleWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('TEST:'),
      )
    })
  })

  describe('when warnOnPendingRequests is not enabled', () => {
    it('should not set up late request warning in afterEach', async () => {
      const consoleWarn = vi.spyOn(console, 'warn')
      configure({
        defaultHost: 'my-host',
        mount: render,
        warnOnPendingRequests: false,
      })

      wrap(GreetingComponent)
        .withNetwork([
          {
            path: '/request1',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 1 },
            responseBody: { name: 'Joe' },
          },
          {
            path: '/request2',
            host: 'my-host',
            method: 'POST',
            requestBody: { id: 2 },
            responseBody: { name: 'Sam' },
          },
        ])
        .mount()

      await screen.findByText('Hi Sam!')

      const response = await window.fetch(
        new Request('my-host/late-request', { method: 'POST' }),
      )

      expect(consoleWarn).not.toBeCalled()

      expect(response).toBeDefined()
      expect(response.status).toBe(200)
      expect(response.ok).toBe(true)
      const json = await response.json()
      expect(json).toBeUndefined()

      expect(consoleWarn).not.toHaveBeenCalledWith(
        expect.stringContaining('late request detected after test finished:'),
      )
    })
  })
})
