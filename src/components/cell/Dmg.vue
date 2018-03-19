<template lang="pug">
  .damage {{value}}
</template>

<script>
import _ from 'lodash'

export default {
  data: {
    property: String,
    props: Object
  },
  props: ['props', 'property'],
  computed: {
    value: function () {
      return this.props[this.property]
    }
  },
  exports: {
    value (data, key) {
      return data.battle.damage[key]
    },
    total (array, key) {
      const sum = _.sumBy(array, `battle.damage.${key}`)
      const avg = (sum / array.length).toFixed()
      return avg
    }
  }
}
</script>
