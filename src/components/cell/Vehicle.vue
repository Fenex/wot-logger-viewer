<template lang="pug">
  .cell-vehicle-bg(v-wot-vehicle-bg="vehicle")
    .cell-vehicle-row
      .cell-vehicle-name(:class="{premium: isPremium(vehicle)}").
        {{vehicle | wot-vehicle-name}}

    .cell-vehicle-row
      .cell-vehicle-info(v-wot-vehicle-type-bg="vehicle").
        {{vehicle | wot-vehicle-tier | wot-tier}}
</template>

<script>
import Vue from "vue"
import _ from 'lodash'

Vue.directive('wot-vehicle-bg', (el, binding) => {
  var icon = Vue.options.filters['wot-vehicle-icon'](binding.value)
  el.style.backgroundImage = "url(./static/img/vehicles/" + icon + ".png)"
})

Vue.directive('wot-vehicle-type-bg', (el, binding) => {
  var icon = Vue.options.filters['wot-vehicle-type'](binding.value)
  el.style.backgroundImage = "url(./static/img/vehicle-types/" + icon + ".png)"
})

export default {
  props: ['vehicle'],
  methods: {
    isPremium (id) {
      return this.$options.filters['wot-vehicle-ispremium'](id)
    }
  },
  exports: {
    value (data) {
      const id = data.vehicle.id
      const name = Vue.options.filters['wot-vehicle-name']
      const tier = Vue.options.filters['wot-vehicle-tier']
      return tier(id).toString(16) + name(id)
    },
    total (array) {
      const tier = Vue.options.filters['wot-vehicle-tier']
      return 'Tier: ' + (
          _.sumBy(array, i => tier(i.vehicle.id)) / array.length
        ).toFixed(1)
    }
  }
}
</script>

<style lang="scss">
.el-table td {
  &.cell-vehicle {
    padding: 0px;
  }
  .cell-vehicle-bg {
    // margin: 2px;
    height: 30px;
    width: 100%;
    background-repeat: no-repeat;
    text-align: right;
    display: table;

    .cell-vehicle-row {
      display: table-row;
      line-height: 18px;
    }
  }

  .cell-vehicle-name {
    height: 15px;
  }
  .cell-vehicle-name.premium {
    color: #beb41b;
  }
  .cell-vehicle-info {
    height: 16px;
    background-repeat: no-repeat;
    background-position-x: right;
    padding-right: 18px;
    font-size: 12px;
  }
}
</style>
