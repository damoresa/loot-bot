<template>
  <div>
    <div class="card">
      <div class="card-header">Filters</div>
      <div class="card-body">
        <div class="form-group row">
          <label for="startDate" class="col-md-2 col-form-label">Start date</label>
          <input type="date" id="startDate" class="col-md-3 form-control" v-model="startDate">
        </div>
        <div class="form-group row">
          <label for="endDate" class="col-md-2 col-form-label">End date</label>
          <input type="date" id="endDate" class="col-md-3 form-control" v-model="endDate">
        </div>
        <div class="offset-md-6 col-md-6 d-flex justify-content-end">
          <button type="button" class="btn btn-secondary mr-2" v-on:click="reset">Reset</button>
          <button type="button" class="btn btn-primary" v-on:click="filter">Filter</button>
        </div>
      </div>
    </div>

    <div class="col-md-12 row p-3">
      <div class="col-md-12 row">
        <div id="xpContainer" class="col-md-6"></div>
        <div id="shContainer" class="col-md-6"></div>
      </div>
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>Code</th>
              <th>Date</th>
              <th>Experience</th>
              <th>Loot</th>
              <th>Expenses</th>
              <th>Share</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hunt of hunts"  v-bind:key="hunt.code">
              <td>
                <router-link :to="{ path: `/hunts/${hunt.code}` }">{{ hunt.code }}</router-link>
              </td>
              <td>{{ hunt.date }}</td>
              <td>{{ hunt.experience }}</td>
              <td>{{ hunt.loot }}</td>
              <td>{{ hunt.expenses }}</td>
              <td>{{ hunt.share }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Highcharts from 'highcharts'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'

import {getToken} from './../utils/auth'

// Enable Highcharts no data
HighchartsNoData(Highcharts)

export default {
  name: 'HuntsData',
  data: function () {
    return {
      startDate: '',
      endDate: '',
      hunts: [],
      errors: []
    }
  },
  created: function () {
    this.loadHunts()
  },
  methods: {
    filter: function (event) {
      this.loadHunts()
    },
    reset: function (event) {
      this.startDate = ''
      this.endDate = ''
      this.loadHunts()
    },
    loadHunts: function () {
      axios.get(`/api/reports/hunts`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        params: {
          startDate: this.startDate,
          endDate: this.endDate
        }
      })
        .then(response => {
          // It's annoying that Axios automatically creates a 'data' node
          const data = response.data
          if (data.data) {
            this.hunts = data.data.hunts
          } else {
            this.errors.push(data.data.error)
          }

          const sharesData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.share
            }
          })
        this.shContainer.series[0].setData([])
          for (const data of sharesData) {
            this.shContainer.series[0].addPoint(data)
          }

          const experienceData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.experience
            }
          })
          this.xpContainer.series[0].setData([])
          for (const data of experienceData) {
            this.xpContainer.series[0].addPoint(data)
          }
        })
        .catch(error => {
          this.errors.push(error)
        })
    }
  },
  mounted: function () {
    this.shContainer = Highcharts.chart('shContainer', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Shares'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Data',
        colorByPoint: true,
        data: []
      }]
    })

    this.xpContainer = Highcharts.chart('xpContainer', {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: 'Experience'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        name: 'Data',
        colorByPoint: true,
        data: []
      }]
    })
  },
  beforeDestroy: function () {
    this.shContainer.destroy()
    this.xpContainer.destroy()
  }
}
</script>

<style scoped>

</style>
