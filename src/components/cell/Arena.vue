<template lang="pug">
  .cell-arena(v-popup-map-preview="arena").
    {{arena | wot-arena-title}}
</template>

<script>
import Vue from 'vue'
import PopupMapPreviewPlugin from '@/services/plugins/popup-map-preview'

Vue.use(PopupMapPreviewPlugin)

export default {
  props: ['arena'],
  exports: {
    value (data) {
      return Vue.options.filters['wot-arena-title'](data.arena.id)
    },
    total (array) {
      // const victories = array.filter(item => item.battle.isVictory).length
      let victories = 0
      array.forEach(item => {
        item.battle.isVictory && victories++
      })
      let proc = (victories / array.length * 100).toFixed(2)

      return `${victories} / ${array.length} (${proc}%)`
    }
  }
}
</script>

<style>
.el-table .cell-arena {
  text-align: center;
}
</style>


