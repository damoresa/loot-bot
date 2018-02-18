<template>
  <div class="row">
    <div class="col-md-6">
      <div class="card home-card mb-1">
        <img class="card-img-top home-card-img" src="./../assets/submit-data.jpeg" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title"><strong>Submit your hunts</strong></h5>
          <p class="card-text">
            Store your hunt reports on our cloud and have every participant report their expense. You'll be
            able to track your latest hunts and their data such as experience and loot obtained, participants
            expenses, monsters killed and items looted.
          </p>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card home-card mb-1">
        <img class="card-img-top home-card-img" src="./../assets/manage-loot.jpeg" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title"><strong>Manage your loot</strong></h5>
          <p class="card-text">
            Easily manage your hunts' loot data: the application will split the loot between participants
            so you don't have to do it manually anymore. You can also keep track of your latest hunts
            and evaluate them in order to analyze how you've been doing and your best spots.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import {isLoggedIn, storeToken} from './../utils/auth'
import {EventBus} from './../utils/bus'

export default {
  name: 'Home',
  data: function () {
    return {
      errors: []
    }
  },
  methods: {
    validateToken: function (token) {
      return new Promise((resolve, reject) => {
        axios.post(`/auth/discord/validate`,
          {},
          {
            headers: {
              Authorization: token
            }
          })
          .then(response => {
            const data = response.data

            if (data.validToken) {
              resolve()
            } else {
              reject(new Error('Invalid token'))
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  },
  mounted: function () {
    const token = this.$route.query.token

    if (token) {
      this.validateToken(token)
        .then(
          () => {
            storeToken(token)
            EventBus.$emit('lb-login', 'User logged in')
            this.$router.push({path: '/hunts'})
          },
          error => {
            this.errors.push(error)
          }
        )
    } else if (isLoggedIn()) {
      this.$router.push({path: '/hunts'})
    }
  }
}
</script>

<style scoped>
.home-card {
  min-height: 35rem;
}
.home-card .home-card-img {
  max-height: 22rem;
}
</style>
