import { CONNECTION_STATE, EVENT } from '../constants'
import {
  TOPIC,
  CONNECTION_ACTIONS as CONNECTION_ACTION,
  RPC_ACTIONS as RPC_ACTION,
  EVENT_ACTIONS as EVENT_ACTION,
  RECORD_ACTIONS as RECORD_ACTION,
  AUTH_ACTIONS as AUTH_ACTION,
  Message
} from '../../binary-protocol/src/message-constants'

import { StateMachine } from '../util/state-machine'
import { Services } from '../client'
import { Options } from '../client-options'
import { Socket } from './socket-factory'
import * as NodeWebSocket from 'ws'
import * as utils from '../util/utils'
import * as Emitter from 'component-emitter2'
export type AuthenticationCallback = (success: boolean, clientData: object) => void

const enum TRANSITIONS {
  CONNECTED = 'connected',
  CHALLENGE = 'challenge',
  AUTHENTICATE = 'authenticate',
  RECONNECT = 'reconnect',
  CHALLENGE_ACCEPTED = 'accepted',
  CHALLENGE_DENIED = 'challenge-denied',
  CONNECTION_REDIRECTED = 'redirected',
  TOO_MANY_AUTH_ATTEMPTS = 'too-many-auth-attempts',
  CLOSE = 'close',
  CLOSED = 'closed',
  UNSUCCESFUL_LOGIN = 'unsuccesful-login',
  SUCCESFUL_LOGIN = 'succesful-login',
  ERROR = 'error',
  LOST = 'connection-lost',
  AUTHENTICATION_TIMEOUT = 'authentication-timeout'
}

export class Connection {
  public isConnected: boolean

  private services: Services
  private options: Options
  private stateMachine: StateMachine
  private authParams: object | null
  private authCallback: AuthenticationCallback
  private originalUrl: string
  private url: string
  private heartbeatInterval: number
  private lastHeartBeat: number
  private endpoint: Socket
  private emitter: Emitter
  private handlers: Map<TOPIC, Function>
  private deliberateClose: boolean

  private reconnectTimeout: number | null
  private reconnectionAttempt: number

  constructor (services: Services, options: Options, url: string, emitter: Emitter) {
    this.options = options
    this.services = services
    this.authParams = null
    this.handlers = new Map()
    this.isConnected = false
    // tslint:disable-next-line:no-empty
    this.authCallback = () => {}
    this.emitter = emitter
    this.stateMachine = new StateMachine(
      this.services.logger,
      {
        init: CONNECTION_STATE.CLOSED,
        onStateChanged: (newState: string, oldState: string) => {
          if (newState === oldState) {
            return
          }
          this.isConnected = newState === CONNECTION_STATE.OPEN
          emitter.emit(EVENT.CONNECTION_STATE_CHANGED, newState)
        },
        transitions: [
          { name: TRANSITIONS.CONNECTED, from: CONNECTION_STATE.CLOSED, to: CONNECTION_STATE.AWAITING_CONNECTION },
          { name: TRANSITIONS.CONNECTED, from: CONNECTION_STATE.REDIRECTING, to: CONNECTION_STATE.AWAITING_CONNECTION },
          { name: TRANSITIONS.CONNECTED, from: CONNECTION_STATE.RECONNECTING, to: CONNECTION_STATE.AWAITING_CONNECTION },
          { name: TRANSITIONS.CHALLENGE, from: CONNECTION_STATE.AWAITING_CONNECTION, to: CONNECTION_STATE.CHALLENGING },
          { name: TRANSITIONS.CONNECTION_REDIRECTED, from: CONNECTION_STATE.CHALLENGING, to: CONNECTION_STATE.REDIRECTING },
          { name: TRANSITIONS.CHALLENGE_DENIED, from: CONNECTION_STATE.CHALLENGING, to: CONNECTION_STATE.CHALLENGE_DENIED },
          { name: TRANSITIONS.CHALLENGE_ACCEPTED, from: CONNECTION_STATE.CHALLENGING, to: CONNECTION_STATE.AWAITING_AUTHENTICATION, handler: this.onAwaitingAuthentication.bind(this) },
          { name: TRANSITIONS.AUTHENTICATION_TIMEOUT, from: CONNECTION_STATE.AWAITING_CONNECTION, to: CONNECTION_STATE.AUTHENTICATION_TIMEOUT },
          { name: TRANSITIONS.AUTHENTICATION_TIMEOUT, from: CONNECTION_STATE.AWAITING_AUTHENTICATION, to: CONNECTION_STATE.AUTHENTICATION_TIMEOUT  },
          { name: TRANSITIONS.AUTHENTICATE, from: CONNECTION_STATE.AWAITING_AUTHENTICATION, to: CONNECTION_STATE.AUTHENTICATING },
          { name: TRANSITIONS.UNSUCCESFUL_LOGIN, from: CONNECTION_STATE.AUTHENTICATING, to: CONNECTION_STATE.AWAITING_AUTHENTICATION },
          { name: TRANSITIONS.SUCCESFUL_LOGIN, from: CONNECTION_STATE.AUTHENTICATING, to: CONNECTION_STATE.OPEN },
          { name: TRANSITIONS.TOO_MANY_AUTH_ATTEMPTS, from: CONNECTION_STATE.AUTHENTICATING, to: CONNECTION_STATE.TOO_MANY_AUTH_ATTEMPTS },
          { name: TRANSITIONS.TOO_MANY_AUTH_ATTEMPTS, from: CONNECTION_STATE.AWAITING_AUTHENTICATION, to: CONNECTION_STATE.TOO_MANY_AUTH_ATTEMPTS },
          { name: TRANSITIONS.AUTHENTICATION_TIMEOUT, from: CONNECTION_STATE.AWAITING_AUTHENTICATION, to: CONNECTION_STATE.AUTHENTICATION_TIMEOUT },
          { name: TRANSITIONS.RECONNECT, from: CONNECTION_STATE.RECONNECTING, to: CONNECTION_STATE.RECONNECTING },
          { name: TRANSITIONS.CLOSED, from: CONNECTION_STATE.CLOSING, to: CONNECTION_STATE.CLOSED },
          { name: TRANSITIONS.ERROR, to: CONNECTION_STATE.RECONNECTING },
          { name: TRANSITIONS.LOST, to: CONNECTION_STATE.RECONNECTING },
          { name: TRANSITIONS.CLOSE, to: CONNECTION_STATE.CLOSING },
        ]
      }
    )
    this.originalUrl = utils.parseUrl(url, this.options.path)
    this.url = this.originalUrl
    this.createEndpoint()
  }

  public registerHandler (topic: TOPIC, callback: Function): void {
    this.handlers.set(topic, callback)
  }

  public sendMessage (message: Message): void {
    this.endpoint.sendParsedMessage(message)
  }

  /**
   * Sends the specified authentication parameters
   * to the server. Can be called up to <maxAuthAttempts>
   * times for the same connection.
   *
   * @param   {Object}   authParams A map of user defined auth parameters.
   *                E.g. { username:<String>, password:<String> }
   * @param   {Function} callback   A callback that will be invoked with the authenticationr result
   */
  public authenticate (authParams?: object | null, callback?: AuthenticationCallback | null): void {
    if (typeof authParams !== 'object') {
      throw new Error('invalid argument authParams')
    }

    if (
      this.stateMachine.state === CONNECTION_STATE.CHALLENGE_DENIED ||
<<<<<<< HEAD
      this.stateMachine.state === CONNECTION_STATE.TOO_MANY_AUTH_ATTEMPTS || 
=======
      this.stateMachine.state === CONNECTION_STATE.TOO_MANY_AUTH_ATTEMPTS ||
>>>>>>> 6a5a02fd62827d5d947ce4d5e2449e65880350a8
      this.stateMachine.state === CONNECTION_STATE.AUTHENTICATION_TIMEOUT
    ) {
      this.services.logger.error({ topic: TOPIC.CONNECTION }, EVENT.IS_CLOSED)
      return
    }

<<<<<<< HEAD
    if (authParams) this.authParams = authParams
    if (callback) this.authCallback = callback
=======
    if (authParams) {
      this.authParams = authParams
    }
    if (callback) {
      this.authCallback = callback
    }
>>>>>>> 6a5a02fd62827d5d947ce4d5e2449e65880350a8

    // if (this.stateMachine.state === CONNECTION_STATE.CLOSED && !this.endpoint) {
    //   this.createEndpoint()
    //   return
    // }

    if (this.stateMachine.state === CONNECTION_STATE.AWAITING_AUTHENTICATION && this.authParams) {
      this.sendAuthParams()
    }
  }

  /*
  * Returns the current connection state.
  */
  public getConnectionState (): CONNECTION_STATE {
    return this.stateMachine.state
  }

  /**
   * Closes the connection. Using this method
   * will prevent the client from reconnecting.
   */
  public close (): void {
    this.services.timerRegistry.remove(this.heartbeatInterval)
    this.sendMessage({
      topic: TOPIC.CONNECTION,
      action: CONNECTION_ACTION.CLOSING
    })
    this.stateMachine.transition(TRANSITIONS.CLOSE)
  }

  /**
   * Creates the endpoint to connect to using the url deepstream
   * was initialised with.
   */
  private createEndpoint (): void {
    this.endpoint = this.services.socketFactory(this.url, this.options.socketOptions)

    this.endpoint.onopen = this.onOpen.bind(this)
    this.endpoint.onerror = this.onError.bind(this)
    this.endpoint.onclose = this.onClose.bind(this)
    this.endpoint.onparsedmessages = this.onMessages.bind(this)
  }

  /********************************
  ****** Endpoint Callbacks ******
  /********************************/

  /**
  * Will be invoked once the connection is established. The client
  * can't send messages yet, and needs to get a connection ACK or REDIRECT
  * from the server before authenticating
  */
  private onOpen (): void {
    this.clearReconnect()
    this.lastHeartBeat = Date.now()
    this.checkHeartBeat()
    this.stateMachine.transition(TRANSITIONS.CONNECTED)
  }

  /**
   * Callback for generic connection errors. Forwards
   * the error to the client.
   *
   * The connection is considered broken once this method has been
   * invoked.
   */
  private onError (error: NodeJS.ErrnoException) {
    /*
     * If the implementation isn't listening on the error event this will throw
     * an error. So let's defer it to allow the reconnection to kick in.
     */
    setTimeout(() => {
      let msg
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
        msg = `Can't connect! Deepstream server unreachable on ${this.originalUrl}`
      } else {
        try {
          msg = JSON.stringify(error)
        } catch (e) {
          msg = error.toString()
        }
      }
      this.services.logger.error({ topic: TOPIC.CONNECTION }, EVENT.CONNECTION_ERROR, msg)
    }, 1)

    this.services.timerRegistry.remove(this.heartbeatInterval)
    this.stateMachine.transition(TRANSITIONS.ERROR)
    this.tryReconnect()
  }

  /**
   * Callback when the connection closes. This might have been a deliberate
   * close triggered by the client or the result of the connection getting
   * lost.
   *
   * In the latter case the client will try to reconnect using the configured
   * strategy.
   */
  private onClose (): void {
    this.services.timerRegistry.remove(this.heartbeatInterval)

    if (this.stateMachine.state === CONNECTION_STATE.REDIRECTING) {
      this.createEndpoint()
      return
    }

    if (
      this.stateMachine.state === CONNECTION_STATE.CHALLENGE_DENIED ||
      this.stateMachine.state === CONNECTION_STATE.TOO_MANY_AUTH_ATTEMPTS ||
      this.stateMachine.state === CONNECTION_STATE.AUTHENTICATION_TIMEOUT
    ) {
      return
    }

    if (this.stateMachine.state === CONNECTION_STATE.CLOSING) {
      this.stateMachine.transition(TRANSITIONS.CLOSED)
      return
    }

    this.stateMachine.transition(TRANSITIONS.LOST)
    this.tryReconnect()
  }

  /**
   * Callback for messages received on the connection.
   */
  private onMessages (parsedMessages: Array<Message>): void {
    for (let i = 0; i < parsedMessages.length; i++) {
      const message = parsedMessages[i] as Message
      if (message === null) {
        continue
      } else if (message.topic === TOPIC.CONNECTION) {
        this.handleConnectionResponse(parsedMessages[i])
      } else if (message.topic === TOPIC.AUTH) {
        this.handleAuthResponse(parsedMessages[i])
      }
    }
  }

  /**
  * Sends authentication params to the server. Please note, this
  * doesn't use the queued message mechanism, but rather sends the message directly
  */
  private sendAuthParams (): void {
    this.stateMachine.transition(TRANSITIONS.AUTHENTICATE)
    this.sendMessage({
      topic: TOPIC.AUTH,
      action: AUTH_ACTION.REQUEST,
      parsedData: this.authParams
    })
  }

  /**
  * Ensures that a heartbeat was not missed more than once, otherwise it considers the connection
  * to have been lost and closes it for reconnection.
  */
  private checkHeartBeat (): void {
    const heartBeatTolerance = this.options.heartbeatInterval * 2

    if (Date.now() - this.lastHeartBeat > heartBeatTolerance) {
      this.services.timerRegistry.remove(this.heartbeatInterval)
      this.services.logger.error({ topic: TOPIC.CONNECTION }, EVENT.HEARTBEAT_TIMEOUT)
      this.endpoint.close()
      return
    }

    this.heartbeatInterval = this.services.timerRegistry.add({
      duration: this.options.heartbeatInterval,
      callback: this.checkHeartBeat,
      context: this
    })
  }

 /**
 * If the connection drops or is closed in error this
 * method schedules increasing reconnection intervals
 *
 * If the number of failed reconnection attempts exceeds
 * options.maxReconnectAttempts the connection is closed
 */
  private tryReconnect (): void {
    if (this.reconnectTimeout !== null) {
      return
    }
    if (this.reconnectionAttempt < this.options.maxReconnectAttempts) {
      this.stateMachine.transition(TRANSITIONS.RECONNECT)
      this.reconnectTimeout = setTimeout(
        this.tryOpen.bind(this),
        Math.min(
          this.options.maxReconnectInterval,
          this.options.reconnectIntervalIncrement * this.reconnectionAttempt
        )
      )
      this.reconnectionAttempt++
      return
    }

    this.emitter.emit(EVENT[EVENT.MAX_RECONNECTION_ATTEMPTS_REACHED], this.reconnectionAttempt)
    this.clearReconnect()
    this.close()
  }

  /**
   * Attempts to open a errourosly closed connection
   */
  private tryOpen (): void {
    if (this.stateMachine.state !== CONNECTION_STATE.REDIRECTING) {
      this.url = this.originalUrl
    }
    this.createEndpoint()
    this.reconnectTimeout = null
  }

  /**
   * Stops all further reconnection attempts,
   * either because the connection is open again
   * or because the maximal number of reconnection
   * attempts has been exceeded
   */
  private clearReconnect (): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    this.reconnectTimeout = null
    this.reconnectionAttempt = 0
  }

  /**
   * The connection response will indicate whether the deepstream connection
   * can be used or if it should be forwarded to another instance. This
   * allows us to introduce load-balancing if needed.
   *
   * If authentication parameters are already provided this will kick of
   * authentication immediately. The actual 'open' event won't be emitted
   * by the client until the authentication is successful.
   *
   * If a challenge is recieved, the user will send the url to the server
   * in response to get the appropriate redirect. If the URL is invalid the
   * server will respond with a REJECTION resulting in the client connection
   * being permanently closed.
   *
   * If a redirect is recieved, this connection is closed and updated with
   * a connection to the url supplied in the message.
   */
  private handleConnectionResponse (message: Message): void {
    if (message.action === CONNECTION_ACTION.PING) {
      this.lastHeartBeat = Date.now()
      this.sendMessage({ topic: TOPIC.CONNECTION, action: CONNECTION_ACTION.PONG })
      return
    }

    if (message.action === CONNECTION_ACTION.ACCEPT) {
      this.stateMachine.transition(TRANSITIONS.CHALLENGE_ACCEPTED)
      return
    }

    if (message.action === CONNECTION_ACTION.CHALLENGE) {
      this.stateMachine.transition(TRANSITIONS.CHALLENGE)
      this.sendMessage({
        topic: TOPIC.CONNECTION,
        action: CONNECTION_ACTION.CHALLENGE_RESPONSE,
        parsedData: this.originalUrl
      })
      return
    }

    if (message.action === CONNECTION_ACTION.REJECT) {
      this.stateMachine.transition(TRANSITIONS.CHALLENGE_DENIED)
      this.endpoint.close()
      return
    }

    if (message.action === CONNECTION_ACTION.REDIRECT) {
      this.url = message.data as string
      this.stateMachine.transition(TRANSITIONS.CONNECTION_REDIRECTED)
      this.endpoint.close()
      return
    }

    if (message.action === CONNECTION_ACTION.AUTHENTICATION_TIMEOUT) {
<<<<<<< HEAD
      this.deliberateClose = true
      this.stateMachine.transition(TRANSITIONS.AUTHENTICATION_TIMEOUT)
      this.services.logger.error(message)
=======
      this.stateMachine.transition(TRANSITIONS.AUTHENTICATION_TIMEOUT)
      this.services.logger.error(message)
      return
>>>>>>> 6a5a02fd62827d5d947ce4d5e2449e65880350a8
    }
  }

  /**
   * Callback for messages received for the AUTH topic. If
   * the authentication was successful this method will
   * open the connection and send all messages that the client
   * tried to send so far.
   */
  private handleAuthResponse (message: Message): void {
    if (message.action === AUTH_ACTION.TOO_MANY_AUTH_ATTEMPTS) {
      this.deliberateClose = true
      this.stateMachine.transition(TRANSITIONS.TOO_MANY_AUTH_ATTEMPTS)
      this.services.logger.error(message)
      return
    }

    if (message.action === AUTH_ACTION.AUTH_UNSUCCESSFUL) {
      this.stateMachine.transition(TRANSITIONS.UNSUCCESFUL_LOGIN)
      this.authCallback(false, { reason: EVENT[EVENT.INVALID_AUTHENTICATION_DETAILS] })
      return
    }

    if (message.action === AUTH_ACTION.AUTH_SUCCESSFUL) {
      this.stateMachine.transition(TRANSITIONS.SUCCESFUL_LOGIN)
      this.authCallback(true, message.parsedData || null)
      return
    }
  }

  private onAwaitingAuthentication (): void {
<<<<<<< HEAD
    if (this.authParams) this.sendAuthParams()
=======
    if (this.authParams) {
      this.sendAuthParams()
    }
>>>>>>> 6a5a02fd62827d5d947ce4d5e2449e65880350a8
  }
}
