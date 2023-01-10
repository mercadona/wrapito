import React from 'react'
import axios from 'axios'
import { render, screen, fireEvent } from '@testing-library/react'
import { wrap, configure } from '../src/index'

it('should have network by default', async () => {
  configure({ mount: render })
  wrap(() => <div></div>).withNetwork([
    { path: '/foo/bar', responseBody: { foo: 'bar' }}
  ]).mount()

  let xhr = new XMLHttpRequest()
  xhr.open('GET', '/foo/bar')
  xhr.send()

  expect(xhr.response).toEqual({ foo: 'bar' })
  expect(xhr.status).toEqual(200)
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