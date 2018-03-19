<!--
Vehicle filter component.
The component creates a dropdown element that include
multiselect listbox and other useful internal filters.
-->

<template lang="pug">
  el-dropdown(
    trigger="click"
    :hide-on-click="false")
    span.el-dropdown-link
      font Vehicle
      = " "
      font(v-if="IsIndeterminate") ({{checked.length}} of {{value.length}})
      i.el-icon-arrow-down.el-icon--right
    el-dropdown-menu(slot="dropdown")
      .wrapper-dropdown-filter.el-dropdown-menu__item
        el-tooltip(content="Check\\uncheck visible items")
          el-checkbox(
            class="chkbox-all"
            :indeterminate="IsIndeterminate"
            v-model="CheckAllVisibleItems"
            @change="ToggleVisible")
        .dropdown-filter-top
          el-input(
            placeholder="vehicle name"
            v-model="vehicle"
            :class="{'filter-action-allow': Vehicle.length}"
            )
            template(slot="append")
              el-tooltip(content="Reset input field")
                el-button(
                  type="primary"
                  icon="el-icon-circle-close-outline"
                  @click="vehicle = ''"
                  :disabled="!Vehicle.length")
          .filter-tier-action
            el-checkbox-group(v-model="tiers")
              el-checkbox-button(
                v-for="tier in [1,2,3,4,5,6,7,8,9,10]"
                :label="tier"
                :key="tier") {{tier | wot-tier}}
            .filter-reset-button
              el-tooltip(content="Show all tiers")
                el-button(
                  icon="el-icon-circle-close-outline"
                  @click="tiers = []"
                  :disabled="!tiers.length"
                )

      .wrapper-dropdown-block
        el-checkbox-group(v-model="checked" @change="handleCheckItemChange")
          el-dropdown-item(
            v-if="IsVisibleItem(item.vehicle.id)"
            v-for="(item, index) in value"
            :key="index")
            el-checkbox(:label="item.vehicle.id")
              font {{item.vehicle.id | wot-vehicle-name}}
              = " "
              span.tier {{item.vehicle.id | wot-vehicle-tier | wot-tier}}
              
</template>

<script>
import _ from 'lodash'
import { FilterPanelMixin } from './mixins'

function isSoftMatch (str, substr) {
  function convert (s) {
    return s.trim().toLowerCase()
    .replace(/[^\da-zёа-я]+/g, '')
    .replace(/[^\da-zёа-я]+/g, '')
    .replaceArray(
      ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'з', 'к', 'л', 'м', 'н', 'о', 'р', 'с', 'т', 'у', 'х', 'и'],
      ['a', 'b', 'v', 'g', 'd', 'e', 'e', '3', 'k', 'l', 'm', 'h', 'o', 'p', 'c', 't', 'y', 'x', 'i']
    )
  }

  str = convert(str)
  substr = convert(substr)
  return str.indexOf(substr) >= 0
}

export default {
  mixins: [ FilterPanelMixin ],
  data () {
    return {
      visible: false,
      position: ["left", "bottom", "left", "top"],
      checked: [],
      filter: 'vehicle',
      vehicle: '',
      tiers: []
    }
  },
  computed: {
    CheckAllVisibleItems () {
      let ids = _.map(this.VisibleItems, 'vehicle.id')
      for (let i = 0; i < ids.length; i++) {
        if (this.checked.indexOf(ids[i]) === -1) {
          return false
        }
      }

      return true
    },
    IsIndeterminate () {
      let ids = _.map(this.VisibleItems, 'vehicle.id')
      let count = 0
      for (let i = 0; i < ids.length; i++) {
        if (this.checked.indexOf(ids[i]) !== -1) {
          count++
        }
      }
      return count !== 0 && count !== this.VisibleItems.length
    },
    Vehicle () {
      return this.vehicle.trim().toLowerCase()
    },
    VisibleItems () {
      return _.filter(this.value, item => this.IsVisibleItem(item.vehicle.id))
    }
  },
  watch: {
    checked () {
      if (!this.value.length) return

      if (!this.checked.length) {
        localStorage.removeItem(this.LSKey)
        this.$emit('changed', this.filter, [])
      } else {
        var obj = _.reduce(this.value, (o, item) => {
          const found = _.find(this.checked, a => a === item.vehicle.id)
          return ((o[item.vehicle.id] = found ? 1 : 0), o)
        }, {})

        localStorage.setItem(this.LSKey, JSON.stringify(obj))
        this.$emit('changed', this.filter, obj)
      }
    }
  },
  methods: {
    ToggleVisible (val) {
      let checked = this.checked
      this.VisibleItems.forEach(item => {
        if (val) { // enable item
          checked.push(item.vehicle.id)
        } else { // disable item
          _.remove(checked, i => i === item.vehicle.id)
        }
      })

      this.checked = _.uniq(checked)
    },
    IsVisibleItem (item_id) {
      if (this.Vehicle.length) {
        // filter by manual input text
        let name = this.$options.filters['wot-vehicle-name'](item_id)
        if (!isSoftMatch(name, this.Vehicle)) return false
      }

      if (this.tiers.length > 0 && this.tiers.length < 10) {
        // filter by tier (checkboxes)
        let tier = this.$options.filters['wot-vehicle-tier'](item_id)
        if (this.tiers.indexOf(tier) === -1) return false
      }

      return true
    }
  },
  mounted () {
    let ls = JSON.parse(localStorage.getItem(this.LSKey) || '{}')

    this.checked = _.reduce(ls,
      (o, value, key) => ((value && o.push(Number(key)), o)), [])
  }
}
</script>

<style lang="scss">
.el-dropdown-link {
  cursor: pointer;
}
.el-dropdown-menu {
  .chkbox-all {
    float: left;
  }
  .dropdown-filter-top {
    margin-left: 30px;

    .filter-tier-action {
      padding-top: 3px;

      .el-checkbox-button.is-checked .el-checkbox-button__inner {
        color: #ffd04b;
        background-color: #10365E;
        border-color: #10365E;
      }
    }

    .filter-tier-action > div {
      font-size: 14px;
      display: inline-block;
    }

    .el-input--mini .el-input__inner {
      height: 30px;
    }

    .filter-tiers {
      padding-top: 5px;
    }

    .filter-reset-button {
      margin-left: 3px;
    }

    .filter-reset-button .el-button,
    .filter-action-allow .el-input-group__append {
      background-color: #e0e0ff;
      border-color: #409EFF;
    }

    .filter-reset-button .el-button {
      &.is-disabled,
      &.is-hover {
        color: gray;
        background-color: #f5f7fa;
        border-color: #dcdfe6;
      }
    }

    .el-input-group__append .el-button {
      padding: 8px 12px;
      color: #10365E;

      &.is-disabled,
      &.is-disabled:hover {
        color: gray;
        background-color: transparent;
        border-color: transparent;
      }
    }
  }
  .wrapper-dropdown-filter {
    border-bottom: 1px solid rgb(202, 202, 202);
    padding-bottom: 6px;
    padding-right: 6px;
    cursor: default;
    min-height: 20px;

    &:hover {
      background-color: white;
    }
  }
  .wrapper-dropdown-block, {
    overflow-y: scroll;
    height: 300px;
    li .tier {
      color: rgb(197, 197, 197);
      font-size: 11px;
    }
    li.el-dropdown-menu__item:focus {
      color: #606266;
    }
    li.el-dropdown-menu__item:not(.is-disabled):hover {
      color: #10365E;
      background-color: #e0e0ff;
    }
    .el-checkbox {
      width: 100%;
    }
  }

  .wrapper-dropdown-block,
  .wrapper-dropdown-filter {
    .el-checkbox__inner::after {
      border-color: #ffd04b;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #10365E;
        border-color: #10365E;
    }
    .el-checkbox__input.is-checked+.el-checkbox__label {
      color: #10365E;
    }
  }
}
</style>

