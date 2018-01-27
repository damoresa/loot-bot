<template>
  <header>
    <nav class="navbar navbar-light bg-light">
      <router-link :to="{path: '/home '}">
        <div class="navbar-brand d-flex">
          <img class="img-fluid mr-1 align-content-center" src="./../assets/blossom_bag.gif"/>
          <p class="align-content-center m-0 p-0">Loot Bot</p>
        </div>
      </router-link>

      <a class="btn btn-outline-primary my-2 my-sm-0" href="/auth/discord/login" v-if="!isLogged">Login</a>
      <button class="btn btn-outline-primary my-2 my-sm-0" type="button" v-on:click="logout()" v-if="isLogged">
        Logout
      </button>
    </nav>
  </header>
</template>

<script>
import {clearToken, isLoggedIn} from './../utils/auth'
import {EventBus} from './../utils/bus'

export default {
  name: 'header-component',
  data: function () {
    return {
      isLogged: isLoggedIn()
    }
  },
  methods: {
    logout: function () {
      clearToken()
      this.isLogged = false
      this.$router.push({path: '/home'})
    }
  },
  created: function () {
    EventBus.$on('lb-login', () => {
      this.isLogged = isLoggedIn()
    })
  }
}
</script>

<style scoped>

</style>
