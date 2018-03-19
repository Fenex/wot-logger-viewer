/**
 * @file collects all ratings and exports notifier subscribers for ETV cache ready
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import WN6 from './rating/wn6'
import WN8 from './rating/wn8'
import EFF from './rating/eff'
import _ from 'lodash'

export default { WN6, WN8, EFF }

/**
 * Check rating ETV cache for ready
 * @param {String} rating name of a rating
 * @returns {Promise<undefined>} resolve promise when cache is ready
 */
function checking (rating) {
  return new Promise(resolve => {
    if (_.isUndefined(rating.ETV)) {
      return resolve()
    }

    var timer = setInterval(function () {
      if (!_.isNull(rating.ETV)) {
        resolve()
        clearInterval(timer)
      }
    }, 10)
  })
}

export const RatingsLoader = {
  /**
   * Notify that all ratings' cahce are ready
   * @param {Function|undefined} callback will be called after resolving the promise
   * @returns {Promise<Array>} resolve promise when all ratings' cache are ready
   */
  OnReady (callback) {
    const promise = Promise.all([
      checking(WN6),
      checking(WN8),
      checking(EFF)
    ])

    if (typeof callback === 'function') {
      promise.then(callback)
    }

    return promise
  }
}
