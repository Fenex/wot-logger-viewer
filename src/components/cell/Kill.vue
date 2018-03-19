<template lang="pug">
  .kills {{props}}
</template>

<script>
import _ from 'lodash'

export default {
  props: ['props'],
  exports: {
    value (data) {
      return data.battle.kills
    },
    total (array) {
      const sum = _.sumBy(array, 'battle.kills')
      const avg = (sum / array.length).toFixed(2)
      return `${avg}/${sum}`
    }
  }
}
</script>
