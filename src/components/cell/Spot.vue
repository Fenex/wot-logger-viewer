<template lang="pug">
  .spotted {{props}}
</template>

<script>
import _ from 'lodash'

export default {
  props: ['props'],
  exports: {
    value (data) {
      return data.battle.spotted
    },
    total (array) {
      const sum = _.sumBy(array, 'battle.spotted')
      const avg = (sum / array.length).toFixed(2)
      return `${avg}/${sum}`
    }
  }
}
</script>
