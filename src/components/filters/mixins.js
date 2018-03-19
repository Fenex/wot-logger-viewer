/**
 * @file exports vue-mixin objects
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'

function LSKey (filter) {
  return 'wl-filter-' + filter
}

/**
 * This is a vue-style mixin object that use in cell components.
 */
export const FilterPanelMixin = {
  props: {
    value: []
  },
  computed: {
    LSKey () {
      return LSKey(this.filter)
    }
  }
}

/**
 * This is a vue-style mixin object that use in `Battle.vue` component.
 * All features related with filtering data of the table was moved to here.
 */
export const FilterTableMixin = {
  computed: {
    battles_view () {
      let filtered = this.battles_all

      if (this.filters.create && this.filters.create.length) {
        filtered = _.filter(filtered, row => {
          let create = new Date(row.arena.create * 1000)
          return (
            create >= this.filters.create[0] &&
            create <= this.filters.create[1]
          )
        })
      }

      /**
       * Note for `arena`, `vehicle` and other similar filters
       *
       * 0 - user unchecked the map
       * 1 - user checked the map
       * undefined - new map, checked by default
       *
       * so remove items with value `0` only:
       */

      if (this.filters.arena) {
        filtered = _.filter(filtered, row => {
          return this.filters.arena[row.arena.id] !== 0
        })
      }

      if (this.filters.vehicle) {
        filtered = _.filter(filtered, row => {
          return this.filters.vehicle[row.vehicle.id] !== 0
        })
      }

      if (this.filters.gametype) {
        filtered = _.filter(filtered, row => {
          return this.filters.gametype[row.arena.gametype] !== 0
        })
      }

      return filtered
    },
    UniqVehicles () {
      return _.uniqBy(this.battles_all, 'vehicle.id')
    },
    UniqArenas () {
      return _.uniqBy(this.battles_all, 'arena.id')
    },
    UniqGametypes () {
      return _.uniqBy(this.battles_all, 'arena.gametype')
    },
    IsOpenFilters () {
      for (let i = 0; i < this.$root.$children.length; i++) {
        if (this.$root.$children[i].IsOpenFilters !== void 0) {
          return this.$root.$children[i].IsOpenFilters
        }
      }
      return false
    }
  },
  methods: {
    onUpdatedFilter (filter, data) {
      this.$set(this.filters, filter, data)
    },
    applyFilters () {
      Object.keys(this.filters).forEach(filter => {
        const key = LSKey(filter)
        const data = localStorage.getItem(key)
        this.filters[filter] = JSON.parse(data || '[]')
      })
    }
  }
}

export default {
  FilterPanelMixin,
  FilterTableMixin
}
