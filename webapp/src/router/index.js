import Vue from 'vue'
import Router from 'vue-router'

import {isLoggedIn} from './../utils/auth'

import Home from '@/components/Home'
import HuntsData from '@/components/HuntsData'
import HuntDetail from '@/components/HuntDetail'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/hunts',
      name: 'HuntsData',
      component: HuntsData
    },
    {
      path: '/hunts/:huntId',
      name: 'HuntDetail',
      component: HuntDetail
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path !== '/home' && !isLoggedIn()) {
    next({path: '/home'})
  } else {
    next()
  }
})

export default router
