import React, { Component } from 'react'

export const MyComponent = props => <div>Foo</div>

export class MyAsyncComponent extends Component {
  state = {
    isReady: false,
  }

  async componentDidMount() {
    const myData = await this.getResource()

    if (!myData) {
      return
    }

    this.setState({ isReady: true })
  }

  getResource() {
    return Promise.resolve('my data')
  }

  render() {
    if (!this.state.isReady) { return null }

    return <div data-test="title">I am ready</div>
  }
}

export class MyComponentMakingHttpCalls extends Component {
  state = {
    quantity: 0,
    isSaved: false,
  }

  componentDidMount = async () => {
    const request = new Request('my-host/path/to/get/quantity/')
    const quantityResponse = await fetch(request)
    if (quantityResponse.status !== 200) {
      this.setState({ quantity: 'error' })
      return
    }
    const quantity = await quantityResponse.json()

    this.setState({ quantity })
  }

  saveQuantity = async () => {
    const request = new Request('my-host/path/to/save/quantity/', {
      method: 'POST',
      body: JSON.stringify({ quantity: this.state.quantity }),
    })
    try {
      await fetch(request)
      this.setState({ isSaved: true })
    } catch (e) {
      this.setState({ isSaved: false })
    }
  }

  render = () => (
    <div data-test="quantity" onClick={ this.saveQuantity }>
      { this.state.quantity }
      { this.state.isSaved && <i aria-label="quantity saved" /> }
    </div>
  )
}