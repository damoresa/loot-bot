<template>
  <div id="app">
    <div class="content-wrapper">
      <Header></Header>
      <div class="container p-3">
        <router-view/>
      </div>
    </div>
    <Footer></Footer>
    <Spinner></Spinner>
    <Toast></Toast>
  </div>
</template>

<script>
import axios from 'axios'
import 'bootstrap'
import Footer from './sections/Footer'
import Header from './sections/Header'
import Spinner from './sections/Spinner'
import Toast from './sections/Toast'
import {EventBus} from './utils/bus'

// Set axios interceptors
// Request
axios.interceptors.request.use((config) => {
  EventBus.$emit('lb-spinner-display', true)
  return config;
}, (error) => {
  EventBus.$emit('lb-spinner-display', false)
  return Promise.reject(error);
})
// Response
axios.interceptors.response.use((response) => {
  EventBus.$emit('lb-spinner-display', false)
  return response;
}, (error) => {
  EventBus.$emit('lb-spinner-display', false)
  return Promise.reject(error);
})

export default {
  components: {
    Footer,
    Header,
    Spinner,
    Toast
  },
  name: 'App'
}
</script>

<style lang="scss">
  // Font Awesome support
  $fa-font-path: '~font-awesome/fonts';
  @import '~font-awesome/scss/font-awesome';
  // Bootstrap 4 support
  @import '~bootstrap/scss/bootstrap.scss';
  html {
    height: 100%;
    margin: 0;
  }
  body {
    background-image: url('./assets/ep_naturalwhite.png');
    background-attachment: fixed;
    height: 100%;
    margin: 0;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    color: #2c3e50;
    height: 100%;
  }
  .content-wrapper {
    height: auto !important;
    min-height: 80%;
    /*margin: 0 auto -8.5rem;*/
    /*padding: 0 0 8.5rem;*/
  }
</style>
