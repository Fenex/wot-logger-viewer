/**
 * @file exports `RatingWN6` class
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import Vue from 'vue'
import _ from 'lodash'
import RatingBase from './base'

function tier (id) {
  return Vue.filter('wot-vehicle-tier')(id)
}

export default class RatingWN6 extends RatingBase {

  /**
   * Gets name of the rating
   * @member {String}
   */
  static get Name () {
    return 'wn6'
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
        wins: _.sumBy(this.data, r => r.battle.isVictory ? 1 : 0)
      }, (r, v, k) => (r[k] = v / this.data.length))

      this.rate =
        (1240 - 1040 / Math.pow(Math.min(6, summary.tier), 0.164)) * summary.kills +
        summary.damage * 530 / (184 * Math.exp(0.24 * summary.tier) + 130) +
        summary.spotted * 125 +
        Math.min(2.2, summary.defeatPoints) * 100 +
        ((185 / (0.17 + Math.exp(-(100 * summary.wins - 35) * 0.134))) - 500) * 0.45 -
        (6 - Math.min(6, summary.tier)) * 60
    }

    return this.rate
  }

  /**
   * Gets calculated xvm-rate
   * @member {Number}
   */
  get RateXVM () {
    if (_.isUndefined(this.xvm)) {
      let rate = this.Rate
      if (rate > 2350) {
        this.xvm = (100).toFixed(0)
      } else {
        this.xvm = Math.max(Math.min(rate * (rate * (rate * (rate * (rate * (-0.000000000000000000852 * rate + 0.000000000000008649) - 0.000000000039744) + 0.00000008406) - 0.00007446) + 0.06904) - 6.19, 100), 0).toFixed(0)
      }
    }

    return this.xvm
  }
}
