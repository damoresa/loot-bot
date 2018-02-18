<template>
  <div class="lb-toast alert alert-dismissible fade" role="alert" :class="[{ 'show': show }, alertType]">
    {{ message }}
    <button type="button" class="close" v-on:click="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>

<script>
import {EventBus} from './../utils/bus'

// TODO: Improve implementation to provide:
//        1. Add icons - font-awesome as base

export default {
  name: 'Toast',
  data: function () {
    return {
      type: 'success',
      message: 'Example message',
      show: false
    }
  },
  computed: {
    alertType () {
      return `alert-${this.type}`
    }
  },
  created: function () {
    EventBus.$on('lb-toast-display', (event) => {
      this.type = event.type
      this.message = event.message
      this.show = true
    })
  },
  methods: {
    close: function () {
      this.show = false
    }
  }
}
</script>

<style scoped>
.lb-toast {
  position: fixed;
  width: 40%;
  left: 30%;
  bottom: 1rem;
  z-index: 1050;
}
</style>
