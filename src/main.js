// application entry point

import Vue from 'vue'
import util from './util'
import App from './App'
import router from './router'
import WoTFilters from './services/filters'
import { RatingsLoader } from './services/class/efficiency'
import ElementUI from 'element-ui'

ElementUI.locale(ElementUI.lang.ruRU)

Vue.use(util)
Vue.use(ElementUI, {size: 'mini'})
Vue.use(WoTFilters)

Vue.config.productionTip = false

function initApp () {
  // eslint-disable-next-line no-new
  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
  })
}

RatingsLoader.OnReady(initApp)
