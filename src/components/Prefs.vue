<!--
The component of a `/#/prefs` page.
-->

<template lang="pug">
  .prefs
    dl
      dt WN8:
      dd
        select(v-model="selected")
          option(
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          ) {{option.text}}

      dt WoTLogger GUI path:
      dd
        input(v-model="gui" placeholder="./gui-old/gui.html")

    button(@click="save" class="btn btn-primary") Save
</template>

<script>
import ExpectedValues from '../services/class/efficiency/expected-values'
import _ from 'lodash'

var WN8 = new ExpectedValues('wn8')

export default {
  name: "Prefs",
  data () {
    return {
      selected: String,
      gui: localStorage.getItem('wl-gui'),
      options: []
    }
  },
  methods: {
    save () {
      localStorage.setItem('wl-gui', this.gui)
      WN8.setCurrent(this.selected).then(() => location.reload())
    }
  },
  mounted () {
    _.map(WN8.header, item => {
      this.options.push({
        text: item.title,
        value: item.title
      })
    })

    WN8.CurrentKey.then(key => (this.selected = key))
  }
}
</script>

<style lang="scss">
.prefs {
  & > * {
    margin-left: 10px;
  }
  padding: 20px;
  font-size: 20px;
  input, button, select, option {
    color: black;
  }
  button {
    margin-top: 20px;
    width: 80px;
  }
}
dt {
  float: left;
  color: #cacaca;
  font-weight: normal;
}
dd {
  margin-left: 285px;
  padding-bottom: 20px;
}

</style>
