<template lang="pug">
  .rating(:style="{color: props.color}") {{props.rate | math-floor}}
</template>

<script>
import Ratings from '@/services/class/efficiency'
export default {
  props: ['props'],
  exports: {
    value (data, key) {
      return data.battle.ratings[key.toUpperCase()].rate
    },
    total (array, key) {
      return (new Ratings[key.toUpperCase()](array)).Rate.toFixed()
    }
  }
}
</script>
