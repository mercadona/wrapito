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

export type DefaultUserLib = unknown
export type DefaultUserInstance = unknown
export type DefaultUserSetupOptions = unknown

export interface InteractionDescriptor<
  UserLib = DefaultUserLib,
  UserInstance = DefaultUserInstance,
  UserSetupOptions = DefaultUserSetupOptions,
> {
  UserLib: UserLib
  UserInstance: UserInstance
  UserSetupOptions: UserSetupOptions
}

export type MountResult<UserInteraction extends InteractionDescriptor> =
  UserInteraction['UserInstance'] extends unknown
    ? RenderResult
    : RenderResult & { user: UserInteraction['UserInstance'] }

export interface Wrap<
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> {
  withNetwork: (responses?: NetworkResponses) => Wrap<UserInteraction>
  atPath: (path: string, historyState?: object) => Wrap<UserInteraction>
  withProps: (props: object) => Wrap<UserInteraction>
  withInteraction: (
    config: UserInteraction['UserSetupOptions'],
  ) => Wrap<UserInteraction>
  debugRequests: () => Wrap<UserInteraction>
  mount: () => MountResult<UserInteraction>
}

export interface WrapOptions<SetupOptions = DefaultUserSetupOptions> {
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
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> = <T>(extensionAPI: WrapExtensionAPI, args: T) => Wrap<UserInteraction>

type Extensions<
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> = {
  [key: string]: Extension<UserInteraction>
}

type Component = React.ReactElement<any, any>

export type RenderResult = TLRenderResult
export type Mount<
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> = (component: Component) => MountResult<UserInteraction>

export interface InteractionOptions<
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> {
  userLib: UserInteraction['UserLib']
  setup?: (
    userLib: UserInteraction['UserLib'],
    options?: UserInteraction['UserSetupOptions'],
  ) => UserInteraction['UserInstance']
}

export interface Config<
  UserInteraction extends InteractionDescriptor = InteractionDescriptor,
> {
  defaultHost: string
  mount: Mount<UserInteraction>
  extend: Extensions<UserInteraction>
  changeRoute: (path: string) => void
  history?: BrowserHistory
  portal?: string
  portals?: string[]
  handleQueryParams?: boolean
  interaction?: InteractionOptions<UserInteraction>
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
