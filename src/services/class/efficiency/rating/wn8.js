/**
 * @file exports `RatingWN8` class AND starts to load and apply current ETV
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'
import RatingBase from './base'
import ExpectedValues from '../expected-values'

export default class RatingWN8 extends RatingBase {

  /**
   * Gets name of the rating
   * @member {String}
   */
  static get Name () {
    return 'wn8'
  }

  /**
   * Gets ETV cache ready status
   * @member {Object|null|undefined}
   * @return {undefined} if the rating has no ETV
   * @return {null} if the rating cache is not ready
   * @return {Object} where object is a ETV cache of the rating
   */
  static get ETV () {
    return WN8.etv || null
  }

  /**
   * Gets calculated full-rate
   * @member {Number}
   */
  get Rate () {
    if (_.isUndefined(this.rate)) {
      try {
        /* STEP 0.1 */
        let vehicles = _.transform(this.data,
          (r, v) => {
            const id = v.vehicle.id
            _.isArray(r[id]) ? r[id].push(v) : r[id] = [v]
          }, {})

        /* STEP 0.2 */
        vehicles = _.transform(vehicles,
          (r, battles, k) => {
            r[k] = {
              real: {
                damage: _.sumBy(battles, b => b.battle.damage.dealt) / battles.length,
                spotted: _.sumBy(battles, b => b.battle.spotted) / battles.length,
                kills: _.sumBy(battles, b => b.battle.kills) / battles.length,
                defeatPoints: _.sumBy(battles, b => b.battle.points.defeat) / battles.length,
                wins: _.sumBy(this.data, r => r.battle.isVictory ? 1 : 0) / battles.length * 100
              },
              weight: battles.length,
              exp: _.find(WN8.etv.data, {IDNum: parseInt(k)})
            }
          },
        {})

        /* STEP 1 */
        _.each(vehicles, v => {
          v.calc = {
            damage: v.real.damage / v.exp.expDamage,
            spotted: v.real.spotted / v.exp.expSpot,
            kills: v.real.kills / v.exp.expFrag,
            defeatPoints: v.real.defeatPoints / v.exp.expDef,
            wins: v.real.wins / v.exp.expWinRate
          }
        })

        /* STEP 2 */
        _.each(vehicles, v => {
          v.calc2 = {}
          v.calc2.wins = Math.max(0, (v.calc.wins - 0.71) / (1 - 0.71))
          v.calc2.damage = Math.max(0, (v.calc.damage - 0.22) / (1 - 0.22))
          v.calc2.kills = Math.max(0, Math.min(v.calc2.damage + 0.2, (v.calc.kills - 0.12) / (1 - 0.12)))

          v.calc2.spotted = Math.max(0, Math.min(v.calc2.damage + 0.1, (v.calc.spotted - 0.38) / (1 - 0.38)))
          v.calc2.defeatPoints = Math.max(0, Math.min(v.calc2.damage + 0.1, (v.calc.defeatPoints - 0.10) / (1 - 0.10)))
        })

        /* STEP 3 */
        _.each(vehicles, v => {
          v.rate = 980 * v.calc2.damage +
                   210 * v.calc2.damage * v.calc2.kills +
                   155 * v.calc2.kills * v.calc2.spotted +
                   75 * v.calc2.defeatPoints * v.calc2.kills +
                   145 * Math.min(1.8, v.calc2.wins)
        })

        /* STEP 4 - AVG TOTAL */
        let total = 0
        let weight = 0

        _.each(vehicles, v => {
          total += v.weight * v.rate
          weight += v.weight
        })

        this.rate = (total / weight) | 0
      } catch (e) {
        console.error('WN8 calc error', e)
      }
    }

    return this.rate
  }

  /**
   * Gets converted full-rate into xvm-scale
   * @member {Number}
   */
  get RateXVM () {
    if (_.isUndefined(this.xvm)) {
      let rate = this.Rate
      if (rate > 3800) {
        this.xvm = 100
      } else {
        this.xvm = Math.max(Math.min(rate * (rate * (rate * (rate * (rate * (-0.00000000000000000009762 * rate + 0.0000000000000016221) - 0.00000000001007) + 0.000000027916) - 0.000036982) + 0.05577) - 1.3, 100), 0).toFixed(0)
      }
    }

    return this.xvm
  }
}

/* Start to init current ETV of WN8 rating */
const WN8 = new ExpectedValues(RatingWN8.Name)
WN8.getCurrent().then(etv => {
  WN8.etv = etv.file
})
