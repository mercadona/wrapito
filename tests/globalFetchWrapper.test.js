import { render, wait, fireEvent } from '@testing-library/react'

import { wrap, globalFetchAssertions, configure } from '../src'
import { MyComponentMakingHttpCalls } from './components.mock'
import { refreshProductsList, getTableRowsText } from './helpers'

expect.extend(globalFetchAssertions)

configure({ defaultHost: 'my-host', mount: render })

it('should pass', async () => {
  await fetch('/some/path')

  const path = '/some/path'
  const { pass, message } = globalFetchAssertions.toHaveBeenFetched(path)
  expect(pass).toBeTruthy()
  expect(message()).toBeUndefined()
  expect(path).toHaveBeenFetched()
})

// it('should not pass', async () => {
//   wrap(MyComponentMakingHttpCalls).mount()

//   await wait(() => {
//     const path = '/some/unknown'
//     const { pass, message } = globalFetchAssertions.toHaveBeenFetched(path)
//     expect(pass).toBeFalsy()
//   })
// })
