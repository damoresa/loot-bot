<template>
  <div></div>
</template>

<script>
import Highcharts from 'highcharts'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'

// Enable Highcharts no data
HighchartsNoData(Highcharts)

// TODO: Highstock support

export default {
  name: 'Chart',
  props: ['configuration', 'data'],
  methods: {
    getChart () {
      return this.chart
    }
  },
  mounted: function () {
    this.chart = Highcharts.chart(this.$el, this.configuration)
  },
  beforeDestroy: function () {
    this.chart.destroy()
  }
}
</script>

<style scoped>

</style>
