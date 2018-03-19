/**
 * @file exports `RatingEFF` class
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import Vue from 'vue'
import _ from 'lodash'
import RatingBase from './base'

function tier (id) {
  return Vue.filter('wot-vehicle-tier')(id)
}

function ln (a, b) {
  return Math.log(a) / Math.log(b)
}

export default class RatingEFF extends RatingBase {

  static get Name () {
    return 'eff'
  }

  /**
   * Gets calculated full-rate
   * @member {Number}
   */
  get Rate () {
    if (_.isUndefined(this.rate)) {
      let summary = _.transform({
        tier: _.sumBy(this.data, r => tier(r.vehicle.id)),
        kills: _.sumBy(this.data, r => r.battle.kills),
        damage: _.sumBy(this.data, r => r.battle.damage.dealt),
        spotted: _.sumBy(this.data, r => r.battle.spotted),
        defeatPoints: _.sumBy(this.data, r => r.battle.points.defeat),
        capturePoints: _.sumBy(this.data, r => r.battle.points.capture)
      }, (r, v, k) => (r[k] = v / this.data.length))

      this.rate =
        summary.damage * (10 / (summary.tier + 2)) * 0.23 + (0.23 + 2 * summary.tier / 100) +
        summary.kills * 250 +
        summary.spotted * 150 +
        ln(summary.capturePoints + 1, 1.732) * 150 +
        summary.defeatPoints * 150
    }

    return this.rate
  }

  /**
   * Gets calculate xvm-rate
   * @type {Number}
   */
  get RateXVM () {
    if (_.isUndefined(this.xvm)) {
      let rate = this.Rate
      if (rate > 2300) {
        this.xvm = 100
      } else {
        this.xvm = Math.max(Math.min(rate * (rate * (rate * (rate * (rate * (0.000000000000000006449 * rate - 0.00000000000004089) + 0.00000000008302) - 0.00000004433) - 0.0000482) + 0.1257) - 40.42, 100), 0).toFixed(0)
      }
    }

    return this.xvm
  }
}
