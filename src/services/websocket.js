/**
 * @file exports `ConnWebSocket` class (inherited from `ISubscriber`).
 * @description this is a layer between websocket and javascript class
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from "lodash"
import ISubscriber from "@/services/class/subscriber"

export default class ConnWebSocket extends ISubscriber {
  constructor (cfg) {
    super()

    this.config = {ws: null}
    this.connection = null

    _.extend(this.config, cfg)
  }

  connect () {
    if (!this.config.ws) throw new Error('ws url is undefined')

    this.connection = new WebSocket(this.config.ws)

    _.each(this.Handlers,
      (handler, key) => (this.connection[key] = handler.bind(this))
    )
  }

  send (data) {
    this.connection.send(JSON.stringify(data))
  }

  get Handlers () {
    return {
      onopen: stream => {
        console.log('onopen', this, stream)
      },
      onclose: stream => {
        console.log('onclose', this, stream)
      },
      onmessage: stream => {
        console.log('onmessage', this, stream)
        var msg = JSON.parse(stream.data)
        this.dispatchEvent(msg.messageType, msg.data)
      },
      onerror: stream => {
        console.log('onerror stream', this, stream)
      }
    }
  }

  /**
   * @returns current readyState of the websocket connection
   *  - [undefined connection]: -1
   *  - WebSocket.CONNECTING: 0
   *  - WebSocket.OPEN: 1
   *  - WebSocket.CLOSING: 2
   *  - WebSocket.CLOSED: 3
   */
  get Status () {
    return this.connection ? this.connection.readyState : -1
  }
}
