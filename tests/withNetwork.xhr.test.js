import React from 'react'
import axios from 'axios'
import { render, screen, fireEvent } from '@testing-library/react'
import { wrap, configure } from '../src/index'

it('should have network by default', async () => {
  configure({ mount: render })
  wrap(() => <div></div>).withNetwork([
    { path: '/foo/bar', responseBody: { foo: 'bar' }}
  ]).mount()
  const mockedFn = jest.fn()
  let xhr = new XMLHttpRequest()
  xhr.open('GET', '/foo/bar')
  xhr.onreadystatechange = mockedFn
  xhr.send()

  expect(xhr.response).toEqual({ foo: 'bar' })
  expect(xhr.status).toEqual(200)
  expect(mockedFn).toHaveBeenCalled()
})

it('should have network by default', async () => {
  configure({ mount: render })
  wrap(() => <div></div>).withNetwork([
    { path: '/bar/foo', responseBody: { bar: 'foo' }},
    { path: '/foo/bar', responseBody: { foo: 'bar' }},
  ]).mount()

  const firstResponse = await axios.get('/foo/bar', { responseType: 'application/json' })
  const secondResponse = await axios.get('/bar/foo', { responseType: 'application/json' })

  expect(firstResponse.data).toEqual({ foo: 'bar' })
  expect(secondResponse.data).toEqual({ bar: 'foo' })
})

it('should handle failed axios requests', async () => {
  configure({ mount: render })
  wrap(() => <div></div>).withNetwork([
    { path: '/bar/foo', responseBody: { bar: 'foo' }, status: 400},
  ]).mount()

  try {
    await axios.get('/bar/foo', { responseType: 'application/json' })
  } catch (error) {
    expect(error.name).toBe('AxiosError')
    expect(error.message).toBe('Request failed with status code 400')
    expect(error.response.data).toEqual({ bar: 'foo' })
  }
})