/**
 * @file collects defined Vue filters
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from "lodash"
import Vue from "vue"
import ArenaFilters from './arena.js'
import VehicleFilters from './vehicle.js'
import GametypeFilters from './gametype.js'
import GameInfo from '@/services/game-info'

export default () => {
  const filters = _.extend({},
    ArenaFilters(GameInfo),
    VehicleFilters(GameInfo),
    GametypeFilters(GameInfo)
  )

  _.each(filters, (value, key) => {
    Vue.filter(key, value)
  })

  Vue.filter('math-floor', n => n | 0)
}
