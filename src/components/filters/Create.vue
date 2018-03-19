<!--
Create filter component.
The component create elemnt that allow select date range.
-->

<template lang="pug">
  el-date-picker(
    size="mini"
    type="daterange"
    v-model="value"
    unlink-panels
    range-separator="—"
    start-placeholder="Start date"
    end-placeholder="End date"
    placeholder="placeholder"
    :picker-options="option"
    format="dd.MM.yyyy"
    align="right")
</template>

<script>
import _ from 'lodash'
import * as moment from 'moment'
import { FilterPanelMixin } from './mixins'

export default {
  mixins: [ FilterPanelMixin ],
  data () {
    return {
      filter: 'create',
      option: {
        firstDayOfWeek: 1,
        shortcuts: [{
          text: 'Last 24 hours',
          onClick (picker) {
            const end = moment().add(1, 'years').toDate()
            const start = moment().subtract(1, 'days').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'Last week',
          onClick (picker) {
            const end = moment().add(1, 'years').toDate()
            const start = moment().subtract(1, 'weeks').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'Last month',
          onClick (picker) {
            const end = moment().add(1, 'years').toDate()
            const start = moment().subtract(1, 'months').toDate()
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'Last 3 months',
          onClick (picker) {
            const end = moment().add(1, 'years').toDate()
            const start = moment().subtract(3, 'months').toDate()
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  watch: {
    value (val) {
      let unix = _.map(val, v => _.isObject(v) ? v.getTime() : v)
      localStorage.setItem(this.LSKey, JSON.stringify(unix))
      this.$emit('changed', this.filter, val)
    }
  }
}
</script>

<style lang="scss">
.el-date-editor--daterange.el-input__inner {
  width: 250px;
}
.el-date-editor .el-range-input {
  width: 80px;
}
.el-date-table td:nth-last-child(1) span,
.el-date-table td:nth-last-child(2) span {
  color: red;
}
.el-date-table td.in-range div,
.el-date-table td.in-range div:hover {
  background-color: #e0e0ff;
}
.el-date-table td.end-date span,
.el-date-table td.start-date span {
    background-color: #10365E;
    color: #FFD04B;
}
.el-date-table td.today span,
.el-date-table td.today:hover span {
    color: #10365E;
    background-color: #FFD04B;
}

</style>


