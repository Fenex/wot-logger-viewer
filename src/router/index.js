import VueRouter from 'vue-router'
import Battle from '@/components/Battle'
import Prefs from '@/components/Prefs'
// import Dev from '@/components/Dev'

export default new VueRouter({
  routes: [
    {
      path: '/battle',
      name: 'Battle',
      component: Battle
    },
    // {
    //   path: '/dev',
    //   name: 'Dev',
    //   component: Dev
    // },
    {
      path: '/prefs',
      name: 'Prefs',
      component: Prefs
    },
    {
      path: '',
      name: '404',
      redirect: '/battle'
    }
  ]
})
