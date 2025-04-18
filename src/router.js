import Vue from 'vue'
import Router from 'vue-router'
import Map from './Map.vue'
import NotFound from './NotFound.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Map,
    },
    {
      path: '/map/:view',
      name: 'map',
      component: Map,
    },
    { path: '/404', component: NotFound },
    {
      path: '*', redirect: '/404',
    },
  ],
})
