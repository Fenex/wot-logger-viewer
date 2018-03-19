<template lang="pug">
  el-dropdown(
    trigger="click"
    :hide-on-click="false")
    span.el-dropdown-link
      font Gametype
      = " "
      font(v-if="IsIndeterminate") ({{checked.length}} of {{value.length}})
      i.el-icon-arrow-down.el-icon--right
    el-dropdown-menu(slot="dropdown")
      .wrapper-dropdown-filter.el-dropdown-menu__item
        el-tooltip(content="Check\\uncheck all items")
          el-checkbox(
            class="chkbox-all"
            :indeterminate="IsIndeterminate"
            v-model="checkAll"
            @change="handleCheckAllChange")
      .wrapper-dropdown-block
        el-checkbox-group(v-model="checked")
          el-dropdown-item(
            v-for="(item, index) in value"
            :key="index")
            el-checkbox(:label="item.arena.gametype").
              {{item.arena.gametype | wot-gametype-title}}
</template>

<script>
import _ from 'lodash'
import { FilterPanelMixin } from './mixins'

export default {
  mixins: [ FilterPanelMixin ],
  data () {
    return {
      visible: false,
      position: ["left", "bottom", "left", "top"],
      checked: [],
      filter: 'gametype'
    }
  },
  computed: {
    checkAll () {
      return this.checked.length === this.value.length
    },
    IsIndeterminate () {
      return this.checked.length > 0 && this.checked.length < this.value.length
    }
  },
  watch: {
    checked () {
      if (!this.value.length) return

      if (!this.checked.length) {
        localStorage.removeItem(this.LSKey)
        this.$emit('changed', this.filter, [])
      } else {
        const obj = _.reduce(this.value, (o, item) => {
          const found = _.find(this.checked, a => a === item.arena.gametype)
          return ((o[item.arena.gametype] = found ? 1 : 0), o)
        }, {})

        localStorage.setItem(this.LSKey, JSON.stringify(obj))
        this.$emit('changed', this.filter, obj)
      }
    }
  },
  methods: {
    handleCheckAllChange (val) {
      if (val) {
        this.checked = _.map(this.value, item => item.arena.gametype)
      } else {
        this.checked = []
      }
    }
  },
  mounted () {
    let ls = JSON.parse(localStorage.getItem(this.LSKey) || '{}')

    this.checked = _.reduce(ls,
      (o, value, key) => ((value && o.push(Number(key)), o)), [])
  }
}
</script>