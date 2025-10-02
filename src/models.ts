import React from 'react'
import type { RenderResult as TLRenderResult } from '@testing-library/react'

export type HttpMethod = UpperCaseHttpMethod | Lowercase<UpperCaseHttpMethod>

type UpperCaseHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE'

export interface WrapRequest extends Partial<Request> {
  _bodyInit?: string
  url: string
}

export interface RequestOptions {
  host?: string
  body?: object | string
  method?: HttpMethod
}

export interface WrapResponse extends Partial<Response> {
  /** The call's path we want to mock */
  path: string
  /** To which host the call corresponds to */
  host?: string
  /** The HTTP method we should intercept, defaults to GET */
  method?: HttpMethod
  /** The response for this call */
  responseBody?: object | string
  /** The request to match with the responseBody for this call */
  requestBody?: object
  /** Allows to return multiple response for a call */
  multipleResponses?: Array<Partial<WrapResponse>>
  catchParams?: boolean
  delay?: number
  hasBeenReturned?: boolean
}

export type NetworkResponses = WrapResponse | WrapResponse[]

export type DefaultLib = unknown
export type DefaultInstance = unknown
export type DefaultSetupOptions = unknown

export interface Wrap<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> {
  withNetwork: (
    responses?: NetworkResponses,
  ) => Wrap<Lib, Instance, SetupOptions>
  atPath: (
    path: string,
    historyState?: object,
  ) => Wrap<Lib, Instance, SetupOptions>
  withProps: (props: object) => Wrap<Lib, Instance, SetupOptions>
  withInteraction: (config: SetupOptions) => Wrap<Lib, Instance, SetupOptions>
  debugRequests: () => Wrap<Lib, Instance, SetupOptions>
  mount: () => RenderResult & {
    user?: Instance
  }
}

export interface WrapOptions<SetupOptions = DefaultSetupOptions> {
  Component: unknown
  responses: WrapResponse[]
  props: object
  path: string
  historyState?: object
  hasPath: boolean
  debug: boolean
  interactionConfig?: SetupOptions
}

export interface WrapExtensionAPI {
  addResponses: (responses: Array<WrapResponse>) => unknown
}

type Extension<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> = <T>(
  extensionAPI: WrapExtensionAPI,
  args: T,
) => Wrap<Lib, Instance, SetupOptions>

type Extensions<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> = {
  [key: string]: Extension<Lib, Instance, SetupOptions>
}

type Component = React.ReactElement<any, any>

export type RenderResult = TLRenderResult
export type Mount = (component: Component) => RenderResult

export interface InteractionOptions<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> {
  lib: Lib
  setup?: (lib: Lib, options?: SetupOptions) => Instance
}

export interface Config<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> {
  defaultHost: string
  mount: Mount
  extend: Extensions
  changeRoute: (path: string) => void
  history?: BrowserHistory
  portal?: string
  portals?: string[]
  handleQueryParams?: boolean
  interaction?: InteractionOptions<Lib, Instance, SetupOptions>
}

interface BrowserHistory extends History {
  push: (path: string, historyState?: object) => void
}

export {
  WrapResponse as Response,
  Component,
  BrowserHistory,
  Extension,
  Extensions,
}
