/**
 * @file exports `RatingsBase` abstract class
 * @description See description class
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'
import COLORS from '../colors'

/**
 * The class is provided as a public abstract class
 * from which further "Ratings" classes can be inherited.
 *
 * Created inherited classes MUST:
 *  - (1) be named with mask: `^Rating{rating_name}$`;
 *  - (2) provide an implementation getters:
 *    - [REQUIRED] `Rate`: return calculated number of the rating;
 *    - [REQUIRED] `RateXVM`: return converted `Rate` number into XVM format;
 *    - [OPTIONAL] `ETV`: if the rating require lazy loading third-party data.
 *
 * The key words "MUST", "REQUIRED" and "OPTIONAL" in this JSDoc
 * are to be interpreted as described in RFC-2119.
 */
export default class RatingBase {
  /**
   * @param {Object|Array<Object>} data unserialized outside data
   */
  constructor (data) {
    if (_.isArray(data)) {
      this.data = data
    } else {
      this.data = [data]
    }

    /**
     * Cached calculated full-rate
     * @type {undefined|number}
     */
    this.rate = void 0

    /**
     * Cached calculated xvm-scale rate
     * @type {undefined|number}
     */
    this.xvm = void 0
  }

  /**
   * Name of the rating (based on a ClassName)
   * @type {string}
   */
  static get Name () {
    /**
     * TODO:
     * Waiting for the feature to disable compressing classnames by `uglify-es`.
     * Option property `keep_classnames` already exists in `harmony` dev-tree:
     * https://github.com/mishoo/UglifyJS2/tree/1eb15f46f138e271b2e375497f7de73aa6e2747d#minify-options
     *
     * -- 1/13/2018
     *
    return this.name
      .replace(/^Rating/, '')
      .toLowerCase()
      */
  }

  /**
   * ETV cache
   * @type {object|null|undefined}
   * @return {undefined} if the rating has no ETV
   * @return {null} if the rating cache is not ready
   * @return {object} where object is a ETV cache of the rating
   */
  static get ETV () {
    return void 0
  }

  /**
   * Array of color constants
   * @type {object}
   */
  static get COLORS () {
    return COLORS
  }

  /**
   * Calculated rate color
   * @type {string}
   */
  get Color () {
    let rate = this.RateXVM
    if (isNaN(+rate) && rate !== 'XX') return COLORS.UNDEF
    if (rate < 16.5) return COLORS.VERYBAD
    if (rate < 33.5) return COLORS.BAD
    if (rate < 52.5) return COLORS.NORMAL
    if (rate < 75.5) return COLORS.GOOD
    if (rate < 92.5) return COLORS.VERYGOOD
    return COLORS.UNIQUE
  }

  get FormatX () {
    let rate = String(this.RateXVM)
    if (rate === '100') return 'XX'
    if (isNaN(this.RateXVM)) return '??'
    return rate
  }

}
