<!--
The component of a `/#/battle` page.
-->

<template lang="pug">
  .tab-battles
    transition(name="filters-wrapper")
      .filters-wrapper(v-if="IsOpenFilters")
        wtl-filters(
          :filters="filters"
          :vehicles="UniqVehicles"
          :arenas="UniqArenas"
          :gametypes="UniqGametypes"
          @onUpdatedFilter="onUpdatedFilter")
    el-table(
      class="battles-table"
      size="normal"
      border
      :data="battles_view"
      :default-sort="{prop: 'create', order: 'descending'}"
      :row-class-name="tableRowClassName"
      :max-height="tblHeight"
      show-summary
      :summary-method="callbackTotal"
      )
      el-table-column(label="Create"
        label-class-name="cell-create"
        prop="create"
        width="130"
        :sort-by="callbackSortBy('create')"
        :sortable="true"
        :render-header="renderHeader")
        cell-create(
          slot-scope="scope"
          :props="scope.row.create")

      el-table-column(label-class-name="cell-vehicle"
        :sort-by="callbackSortBy('vehicle')"
        :sortable="true"
        :render-header="renderHeader"
        width="132")
        cell-vehicle(
          slot-scope="scope"
          :vehicle="scope.row.vehicle.id")

      el-table-column(label-class-name="cell-kill"
        prop="kill"
        :sort-by="callbackSortBy('kill')"
        :sortable="true"
        :render-header="renderHeader")
        cell-kill(
          slot-scope="scope"
          :props="scope.row.battle.kills")

      el-table-column(label-class-name="cell-spot"
        :sort-by="callbackSortBy('spot')"
        :sortable="true"
        :render-header="renderHeader")
        cell-spot(
          slot-scope="scope"
          :props="scope.row.battle.spotted")

      el-table-column(label="Damage")
        - var damage = {dealt: "Out", received: "In"}
        each label, key in damage
          el-table-column(label-class-name="cell-dmg-" + key
            :sort-by="callbackSortBy('dmg-" + key + "')"
            :sortable="true"
            :render-header="renderHeader"
            width="70")
            cell-dmg(
              slot-scope="scope"
              :props="scope.row.battle.damage"
              :class=(key == "received" ? "{died: !scope.row.battle.isSurvive}" : "false")
              property=key)

      el-table-column(label="Assist")
        - var assist = {radio: "Radio", track: "Track", stun: "Stun"}
        each label, key in assist
          el-table-column(label-class-name="cell-assist-" + key
            :sort-by="callbackSortBy('assist-" + key + "')"
            :sortable="true"
            :render-header="renderHeader"
            width="50")
            cell-assist(
              slot-scope="scope"
              :props="scope.row.battle.assist"
              property=key)

      el-table-column(label="Rate")
        el-table-column(
          v-for="(rate, index) in ratings"
          :key="index"
          :label="rate"
          :label-class-name="'cell-rating-' + rate.toLowerCase()"
          :sort-by="callbackSortBy('rating-' + rate.toLowerCase())"
          :sortable="true"
          width="50")
          cell-rating(
            slot-scope="scope"
            :props="scope.row.battle.ratings[rate]")

      el-table-column(label="Arena"
        label-class-name="cell-arena"
        :sort-by="callbackSortBy('arena')"
        :sortable="true"
        :render-header="renderHeader"
        width="180")
        cell-arena(
          slot-scope="scope"
          :arena="scope.row.arena.id")

</template>

<script>
import WotDB from '../services/wotdb'
import ConnWebSocket from '../services/websocket'
import Ratings from '../services/class/efficiency'
import CellManager from './cell'
import { FilterTableMixin } from './filters/mixins'
import WtlFilters from './filters/index'
import _ from 'lodash'

const Depends = _.extend({}, { WtlFilters }, CellManager.Items)

const ws = new ConnWebSocket({ws: 'ws://localhost:9684/'})
const db = new WotDB(ws)
db.open()
ws.connect()

const Component = {
  mixins: [
    CellManager.RenderHeader,
    CellManager.Mixin,
    FilterTableMixin
  ],
  data () {
    return {
      ratings: Object.keys(Ratings),
      battles_all: [],
      window: {
        height: document.documentElement.clientHeight,
        width: document.documentElement.clientWidth
      },
      filters: {
        create: [],
        arena: [],
        vehicle: [],
        gametype: []
      },
      AccID: void 0
    }
  },
  watch: { },
  computed: {
    tblHeight () {
      const min = 200
      const offset = 80 + (this.IsOpenFilters ? 50 : 0)
      return (this.window.height - offset < min)
             ? min : this.window.height - offset
    }
  },
  methods: {
    tableRowClassName (e) {
      return e.row.battle.isVictory ? 'victory' : 'defeat'
    },
    callbackSortBy (column) {
      const arg = column.split(/[- ]/)
      return row => this.$_getValue(arg[0])(row, arg[1])
    },
    callbackTotal (e) {
      let total = []

      var calc = column => {
        const arg = column.labelClassName.split(/[- ]/)
        return this.$_calcTotal(arg[1])(e.data, arg[2])
      }

      if (typeof e.index === 'number') {
        // The block for forked ElementUI source
        // (not released yet)
        total[e.index] = calc(e.columns[e.index])
      } else {
        // The block for ElementUI version 2.2.1
        e.columns.forEach((column, index) => {
          total[index] = calc(column)
        })
      }
      return total
    }
  },
  beforeCreate () {
    this.$root.$on('account-changed', id => {
      this.AccID = id
      this.battles_all = []

      db.AllBattles(id).then(battles => {
        battles.forEach(battle => {
          this.battles_all.unshift(battle)
        })
      })
    })

    db.addListener(db.EVENTS.NEW_BATTLE, battles => {
      battles.forEach(battle => {
        if (battle.accountDBID === this.AccID) {
          this.battles_all.unshift(battle)
        } else {
          this.$root.$emit('account-changed', battle.accountDBID)
        }
      })
    })

    window.addEventListener('resize', () => {
      this.window.height = document.documentElement.clientHeight
      this.window.width = document.documentElement.clientWidth
    })
  },
  created () {
    this.applyFilters()
  },
  components: Depends
}

export default Component
</script>

<style lang="scss">
ul.el-popper.el-dropdown-menu {
  box-shadow: 0px 0px 30px black;
}
.el-table {
  th {
    padding: 2px 0px;

    div {
      line-height: unset;
    }
    &:first-child .cell, .cell {
      text-align: center;
      padding-left: 0px;
      padding-right: 0px;
    }

    .caret-wrapper {
      position: absolute;
      top: 0px;
      left: 2px;
      height: 23px;
      width: 15px;

      .sort-caret {
        left: 2px;
        &.ascending {
          top: 0px;
        }
        &.descending {
          bottom: 0px;
        }

      }
    }

    .wl-icon {
      display: inline-block;
      padding: 0;
      height: 26px;
      width: 26px;
      background-image: url('~static/img/iconbar.png');
      background-repeat: no-repeat;

      &.wl-icon-create {
        background-image: url('~static/img/clock.png');
      }
      &.wl-icon-vehicle {
        width: 52px;
        background-position: -598px 0;
      }
      &.wl-icon-kill {
        background-position: -572px 0;
      }
      &.wl-icon-spot {
        background-position: -546px 0;
      }
      &.wl-icon-dmg-dealt {
        width: 52px;
        background-position: -963px 0;
      }
      &.wl-icon-dmg-received {
        width: 52px;
        background-position: -1015px 0;
      }
      &.wl-icon-assist-radio {
        background-position: -416px 0;
      }
      &.wl-icon-assist-track {
        background-position: -442px 0;
      }
      &.wl-icon-assist-stun {
        background-position: -468px 0;
      }
      &.wl-icon-rating-wn6,
      &.wl-icon-assist-wn8,
      &.wl-icon-assist-eff {
        background-position: -598px 0;
      }
      &.wl-icon-arena {
        background-position: -781px 0;
      }
    }
  }
  td {
    padding: 0px;

    .cell {
      padding-left: 2px;
      padding-right: 2px;
    }
  }
  tr.victory {
    background: linear-gradient(#cfffcf, #eaffea, #cfffcf);
  }
  tr.defeat {
    background: linear-gradient(#ffcfcf, #ffeaea, #ffcfcf);
  }
  tr:hover {
    background: rgb(225, 225, 255);
  }
  .died {
    color: #afafaf;
  }
}
</style>
