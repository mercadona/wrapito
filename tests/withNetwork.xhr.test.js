import React from 'react'
import axios from 'axios'
import { render, screen, fireEvent } from '@testing-library/react'
import { wrap, configure } from '../src/index'

// it('should have network by default', async () => {
//   configure({ mount: render })
//   wrap(() => <div></div>).withNetwork([
//     { path: '/foo/bar', responseBody: { foo: 'bar' }}
//   ]).mount()

//   let response
//   let xhr = new XMLHttpRequest()
//   xhr.open('GET', '/foo/bar')
//   xhr.onload = function() {
//     if (xhr.status === 200) {
//       response = { foo: 'bar' }
//     }
//   }
//   xhr.send()

//   expect(response).toEqual({ foo: 'bar' })
// })

fit('should have network by default', async () => {
  configure({ mount: render })
  wrap(() => <div></div>).withNetwork([
    { path: '/bar/foo', responseBody: { bar: 'foo' }},
    { path: '/foo/bar', responseBody: { foo: 'bar' }},
    // { path: '/foo/ramon', method: 'POST', requestBody: { foo: 'bar' }, responseBody: { foo: 'ramon' }},
  ]).mount()

  const firstResponse = await axios.get('/foo/bar', { responseType: 'application/json' })
  const secondResponse = await axios.get('/bar/foo', { responseType: 'application/json' })
  // const ramon = await axios.post('/foo/ramon', { foo: 'bar' }, { responseType: 'application/json' })

  expect(firstResponse.data).toEqual({ foo: 'bar' })
  expect(secondResponse.data).toEqual({ bar: 'foo' })
  // expect(ramon.data).toEqual({ foo: 'ramon' })
})