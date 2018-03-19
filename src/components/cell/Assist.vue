<template lang="pug">
  .assist {{value}}
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
      return data.battle.assist[key]
    },
    total (array, key) {
      const sum = _.sumBy(array, `battle.assist.${key}`)
      const avg = (sum / array.length).toFixed()
      return avg
    }
  }
}
</script>
