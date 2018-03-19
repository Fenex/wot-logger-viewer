<!--
Arena filter component.
The component creates a dropdown element that include multiselect listbox.
All available arenas will be added into listbox.
-->

<template lang="pug">
  el-dropdown(
    trigger="click"
    :hide-on-click="false")
    span.el-dropdown-link
      font Arena
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
        .dropdown-filter-top
          el-input(
            placeholder="arena name"
            v-model="arena"
            :class="{'filter-action-allow': Arena.length}"
            )
            .filter-action(slot="append")
              el-tooltip(content="Check visible items")
                el-button(
                  icon="el-icon-plus"
                  @click="ToggleVisible(1)"
                  :disabled="!Arena.length")
              el-tooltip(content="Uncheck visible items")
                el-button(
                  icon="el-icon-minus"
                  @click="ToggleVisible(0)"
                  :disabled="!Arena.length")
              el-tooltip(content="Show all items")
                el-button(
                  icon="el-icon-circle-close-outline"
                  @click="arena = ''"
                  :disabled="!Arena.length")

      .wrapper-dropdown-block
        el-checkbox-group(v-model="checked")
          el-dropdown-item(
            v-if="IsVisibleItem(item.arena.id)"
            v-for="(item, index) in value"
            :key="index")
            el-checkbox(:label="item.arena.id").
              {{item.arena.id | wot-arena-title}}
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
      filter: 'arena',
      arena: ''
    }
  },
  computed: {
    checkAll () {
      return this.checked.length === this.value.length
    },
    IsIndeterminate () {
      return this.checked.length > 0 && this.checked.length < this.value.length
    },
    Arena () {
      return this.arena.trim().toLowerCase()
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
          const found = _.find(this.checked, a => a === item.arena.id)
          return ((o[item.arena.id] = found ? 1 : 0), o)
        }, {})

        localStorage.setItem(this.LSKey, JSON.stringify(obj))
        this.$emit('changed', this.filter, obj)
      }
    }
  },
  methods: {
    handleCheckAllChange (val) {
      if (val) {
        this.checked = _.map(this.value, item => item.arena.id)
      } else {
        this.checked = []
      }
    },
    IsVisibleItem (arena_id) {
      if (!this.Arena.length) return true

      let arena_name = this.$options.filters['wot-arena-title'](arena_id)
      return arena_name.toLowerCase().indexOf(this.Arena) >= 0
    },
    ToggleVisible (action) {
      if (!this.Arena.length) {
        this.handleCheckAllChange(action)
      } else {
        let arena = this.$options.filters['wot-arena-title']
        let checked = this.checked
        this.value.forEach(item => {
          let arena_name = arena(item.arena.id)
          if (arena_name.toLowerCase().indexOf(this.Arena) >= 0) {
            if (action) {
              checked.push(item.arena.id)
            } else {
              _.remove(checked, i => i === item.arena.id)
            }
          }
        })
        this.checked = _.uniq(checked)
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


