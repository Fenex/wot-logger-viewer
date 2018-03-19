/**
 * @file exports abstract class `ISubscriber`
 * @description class for support event system
 * @example
 * Numbers from 0 to 11 will be displayd with interval in 1 sec:
 * ```
 * class Tick extends ISubscriber {
 *   constructor (sec) {
 *     super()
 *
 *     this.count = 0;
 *     setInterval(() => {
 *       this.dispatchEvent('tick', this.count++)
 *     }, sec * 1000)
 *   }
 * }
 *
 * function cb (n) {
 *   console.log(n)
 *   if (n > 10)
 *     tick.removeListener('tick', cb)
 * }
 *
 * var tick = new Tick(1)
 * tick.addListener('tick', cb)
 * ```
 *
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'

export default class ISubscriber {
  constructor () {
    this._subscribers = {}
  }

  addListener (type, callback) {
    if (!this._subscribers[type]) this._subscribers[type] = []

    this._subscribers[type].push(callback)
  }

  removeListener (type, callback) {
    this._subscribers[type] =
      _.remove(this._subscribers[type], l => l === callback)
  }

  resetAllListeners (type) {
    if (type === void 0) {
      this._subscribers = {}
    } else {
      this._subscribers[type] = []
    }
  }

  dispatchEvent () {
    const args = Array.prototype.slice.call(arguments)
    const type = args.shift(args)
    _.each(this._subscribers[type], subscriber => subscriber.apply(this, args))
  }

  /*
  (?) take out named event constants from here?
  */
  get EVENTS () {
    return ISubscriber.EVENTS
  }

  static get EVENTS () {
    return {
      UNDEFINED: void 0,
      HANDSHAKE: 'DBbattles',
      UPDATE: 'updateBattlesDB',
      NEW_BATTLE: 'newBattle',
      REQUEST_BATTLES: 'needBattles'
    }
  }
}
