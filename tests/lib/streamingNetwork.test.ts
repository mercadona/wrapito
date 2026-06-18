import { render, screen, act } from '@testing-library/react'
import { it, expect, vi } from 'vitest'
import { wrap, configure } from '../../src/index'

import { MyStreamingChatComponent } from '../components.mock'

it('should stream all chunks and close', async () => {
  configure({ mount: render })

  wrap(MyStreamingChatComponent)
    .withStreamingNetwork({
      path: '/chat/stream/',
      host: 'my-host',
      method: 'POST',
      chunks: ['Hello', 'world', '!'],
    })
    .mount()

  expect(await screen.findByText('Hello')).toBeInTheDocument()
  expect(await screen.findByText('world')).toBeInTheDocument()
  expect(await screen.findByText('!')).toBeInTheDocument()
  expect(screen.queryByText('Streaming...')).not.toBeInTheDocument()
})

it('should show streaming indicator while stream is open', async () => {
  configure({ mount: render })

  wrap(MyStreamingChatComponent)
    .withStreamingNetwork({
      path: '/chat/stream/',
      host: 'my-host',
      method: 'POST',
      chunks: ['Partial response...'],
      keepOpen: true,
    })
    .mount()

  expect(await screen.findByText('Partial response...')).toBeInTheDocument()
  expect(screen.getByText('Streaming...')).toBeInTheDocument()
})

it('should stream chunks with per-chunk delay', async () => {
  configure({ mount: render })

  wrap(MyStreamingChatComponent)
    .withStreamingNetwork({
      path: '/chat/stream/',
      host: 'my-host',
      method: 'POST',
      chunks: [
        { text: 'First' },
        { text: 'second', delay: 20 },
        { text: 'third', delay: 20 },
      ],
    })
    .mount()

  expect(await screen.findByText('First')).toBeInTheDocument()
  expect(await screen.findByText('second')).toBeInTheDocument()
  expect(await screen.findByText('third')).toBeInTheDocument()
})

it('should stream chunks with global delay between chunks', async () => {
  configure({ mount: render })

  wrap(MyStreamingChatComponent)
    .withStreamingNetwork({
      path: '/chat/stream/',
      host: 'my-host',
      method: 'POST',
      chunks: ['Chunk A', 'Chunk B'],
      delayBetweenChunks: 20,
    })
    .mount()

  expect(await screen.findByText('Chunk A')).toBeInTheDocument()
  expect(await screen.findByText('Chunk B')).toBeInTheDocument()
})

it('should deliver chunks sequentially, not all at once', async () => {
  vi.useFakeTimers()
  configure({ mount: render })

  wrap(MyStreamingChatComponent)
    .withStreamingNetwork({
      path: '/chat/stream/',
      host: 'my-host',
      method: 'POST',
      chunks: [
        { text: 'First' },
        { text: 'Second', delay: 100 },
        { text: 'Third', delay: 100 },
      ],
    })
    .mount()

  await act(async () => vi.advanceTimersByTimeAsync(0))
  expect(screen.getByText('First')).toBeInTheDocument()
  expect(screen.queryByText('Second')).not.toBeInTheDocument()

  await act(async () => vi.advanceTimersByTimeAsync(100))
  expect(screen.getByText('Second')).toBeInTheDocument()
  expect(screen.queryByText('Third')).not.toBeInTheDocument()

  await act(async () => vi.advanceTimersByTimeAsync(100))
  expect(screen.getByText('Third')).toBeInTheDocument()

  vi.useRealTimers()
})
