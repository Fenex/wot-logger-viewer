<template lang="pug">
  #app
    el-container
      el-header(height)
        el-menu(
          :default-active="activeMenu"
          mode="horizontal"
          @select="handleSelectMenu"
          background-color="#10365E"
          text-color="#ffffff"
          active-text-color="#ffd04b")

          el-menu-item(index="battle") My battles
          el-menu-item(index="prefs") Prefs
          el-menu-item(v-if="IsWLGUI" @click="openWLGUI")
            div(@click="openWLGUI") WotLogger-GUI

          .menu-right
              el-checkbox(v-if="IsBattles" v-model="IsOpenFilters")
                i.el-icon-search
          
          wtl-account

      el-main
        transition
          keep-alive
            router-view
      el-footer(height) Footer
</template>

<script>
import AccountComponent from './components/Account'

export default {
  name: 'App',
  data () {
    return {
      activeMenu: 'battle',
      IsWLGUI: localStorage.getItem('wl-gui'),
      IsOpenFilters: JSON.parse(
        localStorage.getItem('wl-view-filters') || "false")
    }
  },
  watch: {
    IsOpenFilters (val) {
      localStorage.setItem('wl-view-filters', JSON.stringify(val))
    }
  },
  computed: {
    IsBattles () {
      return (this.$route.name === "Battle")
    }
  },
  methods: {
    handleSelectMenu (a) {
      a && this.$router.push(a)
    },
    openWLGUI () {
      if (this.IsWLGUI) {
        window.location = this.IsWLGUI
      }
    }
  },
  components: {
    'wtl-account': AccountComponent
  }
}
</script>

<style lang="scss">
html, body {
  margin: 0;
}

.el-main {
  padding-top: 0px;
}

.el-header, footer {
  background-color: #10365E;
  color: #333;
  line-height: 30px;
  height: 30px;

  .el-menu {
    * {
      outline: none;
    }
    .menu-right {
      display: inline-block;
      .el-checkbox__input {
        display: none;
      }
      .el-checkbox__label {
        color: white;
      }
      .is-checked .el-checkbox__label {
        color: #ffd04b;
      }
    }
  }
}

footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px;
  z-index: 10;
}
ul.el-menu {
  line-height: 30px;
  height: 30px;

  li.el-menu-item {
    font-size: 16px;
    line-height: 30px;
    height: 30px;
    text-transform: uppercase;

    a.wl-gui-link {
      text-decoration: none;
    }
  }
}
</style>
