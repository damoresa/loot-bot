<template>
  <div v-show="show">
    <div class="spinner-overlay">
    </div>
    <div class="spinner-container">
      <div class="spinner">
        <div class="rect1"></div>
        <div class="rect2"></div>
        <div class="rect3"></div>
        <div class="rect4"></div>
        <div class="rect5"></div>
        <p class="spinner-label">Processing golds...</p>
      </div>
    </div>
  </div>
</template>

<script>
import {EventBus} from './../utils/bus'

export default {
  name: "Spinner",
  data: function () {
    return {
      show: false
    }
  },
  created: function () {
    EventBus.$on('lb-spinner-display', (display) => {
      this.show = display
    })
  },
}
</script>

<style scoped>
.spinner-overlay {
  background-color: grey;
  position: fixed;
  top: 0%;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.spinner-container {
  position: fixed;
  width: 40%;
  top: 50%;
  left: 30%;
}

.spinner-label {
  margin-top: 1rem;
  color: black;
  font-weight: 800;
  font-size: 30px;
}

.spinner {
  height: 90px;
  text-align: center;
  font-size: 10px;
}

.spinner > div {
  background-color: darkgoldenrod;
  height: 100%;
  width: 15px;
  display: inline-block;

  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner .rect2 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}

.spinner .rect3 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

.spinner .rect4 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

.spinner .rect5 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

@-webkit-keyframes sk-stretchdelay {
  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
  20% { -webkit-transform: scaleY(1.0) }
}

@keyframes sk-stretchdelay {
  0%, 40%, 100% {
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }  20% {
       transform: scaleY(1.0);
       -webkit-transform: scaleY(1.0);
     }
}
</style>
