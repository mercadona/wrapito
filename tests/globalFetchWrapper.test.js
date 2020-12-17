import { render, wait, fireEvent } from '@testing-library/react'

import { wrap, globalFetchAssertions, configure } from '../src'
import { MyComponentMakingHttpCalls } from './components.mock'
import { refreshProductsList, getTableRowsText } from './helpers'

expect.extend(globalFetchAssertions)

configure({ defaultHost: 'my-host', mount: render })

it('this is a placeholder', async () => {
  wrap(MyComponentMakingHttpCalls).mount()

  await wait(() => {
    const inputValue = 'whatever'
    const { pass, message } = globalFetchAssertions.newAssertion(inputValue)
    expect(pass).toBeTruthy()
    expect(message()).toBeUndefined()
    expect(inputValue).newAssertion()
  })
})
