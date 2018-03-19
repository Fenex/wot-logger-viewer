<!--
FilterBar component.
Insert a DOM element that include all imported filter components.
-->

<template lang="pug">
  .filters
    wtl-filter-create(
      :value="filters.create"
      @changed="onUpdatedFilter")
    wtl-filter-arena(
      :value="arenas"
      @changed="onUpdatedFilter"
    )
    wtl-filter-vehicle(
      :value="vehicles"
      @changed="onUpdatedFilter"
    )
    wtl-filter-gametype(
      :value="gametypes"
      @changed="onUpdatedFilter"
    )
</template>

<script>
import FilterCreate from './Create'
import FilterArena from './Arena'
import FilterVehicle from './Vehicle'
import FilterGametype from './Gametype'

import _ from 'lodash'

let filters = {
  FilterCreate,
  FilterArena,
  FilterVehicle,
  FilterGametype
}

export default {
  props: {
    filters: Object,
    arenas: Object,
    vehicles: Object,
    gametypes: Object
  },
  components: _.mapKeys(filters, (value, key) => 'wtl-' + _.kebabCase(key)),
  methods: {
    onUpdatedFilter (filter, data) {
      this.$emit('onUpdatedFilter', filter, data)
    }
  }
}
</script>

<style lang="scss">
.tab-battles .filters-wrapper {
  height: 48px;
  background-color: #e0e0ff;

  .filters {
    padding: 10px 10px;

    & > * {
      padding: 0px 10px;
      display: inline-block;
    }
  }

  &.filters-wrapper-enter-active,
  &.filters-wrapper-leave-active {
    transition: height 500ms;
  }

  &.filters-wrapper-enter,
  &.filters-wrapper-leave-to {
    height: 0px;
  }
}
</style>

