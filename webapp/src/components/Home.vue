<template>
  <div></div>
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
              reject('Invalid token')
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

</style>
