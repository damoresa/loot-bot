<template>
  <footer>
    <div class="row justify-content-center p-4 m-0 footer">
      <p class="col-8 text-center">
        <a class="unformatted-link" href="https://loot-bot.herokuapp.com"><strong>loot-bot.com</strong></a>
        © 2018. All rights reserved.
      </p>
      <p class="col-8 text-center">
        Please note that Tibia's only official website is
        <a class="unformatted-link" href="http://www.tibia.com" target="_blank"><strong>www.tibia.com</strong></a>.
        Tibia is copyrighted by
        <a class="unformatted-link" href="https://www.cipsoft.com/" target="_blank"><strong>CipSoft GmbH</strong></a>.
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
footer {
  background-color: #343a40;
  height: 20%;
  color: #FFFFFF;
}
footer .footer {
  background-color: inherit;
}
footer .unformatted-link {
  /* no underline */
  color: white;
  text-decoration: none;
}
</style>
