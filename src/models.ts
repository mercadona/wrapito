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

export interface InteractionDescriptor<
  Lib = DefaultLib,
  Instance = DefaultInstance,
  SetupOptions = DefaultSetupOptions,
> {
  Lib?: Lib
  Instance?: Instance
  SetupOptions?: SetupOptions
}

export interface Wrap<I extends InteractionDescriptor = InteractionDescriptor> {
  withNetwork: (responses?: NetworkResponses) => Wrap<I>
  atPath: (path: string, historyState?: object) => Wrap<I>
  withProps: (props: object) => Wrap<I>
  withInteraction: (config: I['SetupOptions']) => Wrap<I>
  debugRequests: () => Wrap<I>
  mount: () => RenderResult & {
    user?: I['Instance']
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

type Extension<I extends InteractionDescriptor = InteractionDescriptor> = <T>(
  extensionAPI: WrapExtensionAPI,
  args: T,
) => Wrap<I>

type Extensions<I extends InteractionDescriptor = InteractionDescriptor> = {
  [key: string]: Extension<I>
}

type Component = React.ReactElement<any, any>

export type RenderResult = TLRenderResult
export type Mount = (component: Component) => RenderResult

export interface InteractionOptions<
  I extends InteractionDescriptor = InteractionDescriptor,
> {
  lib: I['Lib']
  setup?: (lib: I['Lib'], options?: I['SetupOptions']) => I['Instance']
}

export interface Config<
  I extends InteractionDescriptor = InteractionDescriptor,
> {
  defaultHost: string
  mount: Mount
  extend: Extensions<I>
  changeRoute: (path: string) => void
  history?: BrowserHistory
  portal?: string
  portals?: string[]
  handleQueryParams?: boolean
  interaction?: InteractionOptions<I>
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
