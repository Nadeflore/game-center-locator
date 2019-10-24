import Vue from 'vue'
import Router from 'vue-router'
import Map from './Map.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Map
    },
    {
      path: '/selected/:selectedGameCenterName',
      name: 'selected',
      component: Map
    }
  ]
})
