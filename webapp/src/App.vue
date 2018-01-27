<template>
  <div id="app">
    <header-component></header-component>
    <div class="container p-3">
      <router-view/>
    </div>
    <footer-component></footer-component>
  </div>
</template>

<script>
// eslint-disable-next-line
import $ from 'jquery'
import Footer from './sections/Footer'
import Header from './sections/Header'

export default {
  components: {
    'footer-component': Footer,
    'header-component': Header
  },
  name: 'App'
}
</script>

<style lang="scss">
  // Font Awesome support
  $fa-font-path: '~font-awesome/fonts';
  @import '~font-awesome/scss/font-awesome';
  // Bootstrap 4 support
  @import './../node_modules/bootstrap/scss/bootstrap.scss';
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    color: #2c3e50;
  }
</style>
