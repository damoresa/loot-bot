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
    <div class="pt-3">
      <div class="card">
        <div class="card-header">Hunt data</div>
        <div class="card-body">
          <div class="col-md-12 row">
            <div class="col-md-6">
              <Chart :configuration="xpChartConfiguration" ref="xpChart"></Chart>
            </div>
            <div class="col-md-6">
              <Chart :configuration="shChartConfiguration" ref="shChart"></Chart>
            </div>
          </div>
          <div class="col-md-12 row justify-content-end pb-3">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addReportModal">
              <i class="fa fa-plus" aria-hidden="true"></i>&nbsp;Add report
            </button>
            <Modal modalId="addReportModal">
              <h5 slot="header" class="modal-title" id="addReportModalLabel">Add report</h5>
              <div slot="body" class="col-md-12">
                <form id="lootDataForm" @submit="submitLootData" novalidate>
                  <div class="form-group">
                    <label for="lootData">Loot data:</label>
                    <textarea v-model="lootData" class="form-control" rows="15" id="lootData"
                              placeholder="Introduce your loot report here"></textarea>
                    <div v-for="error of fieldErrors('lootData')" v-bind:key="error.error"
                         class="alert alert-danger mt-1" role="alert">
                      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;{{ error.error }}
                    </div>
                  </div>
                </form>
              </div>
              <div slot="footer" class="col-md-12 text-right">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-primary" form="lootDataForm" :disabled="!isValid">Store report</button>
              </div>
            </Modal>
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
                <tr v-for="hunt of hunts" v-bind:key="hunt.code">
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
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import Chart from './../sections/Chart'
import Modal from './../sections/Modal'
import {getToken} from './../utils/auth'
import {EventBus} from './../utils/bus'

export default {
  name: 'HuntsData',
  components: {
    Chart,
    Modal
  },
  data: function () {
    return {
      lootData: '',
      formErrors: [],
      pristineForm: true,
      startDate: '',
      endDate: '',
      hunts: [],
      errors: [],
      xpChartData: [],
      shChartData: [],
      xpChartConfiguration: {
        chart: {
          backgroundColor: null,
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
                color: 'black'
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
          data: this.xpChartData
        }]
      },
      shChartConfiguration: {
        chart: {
          backgroundColor: null,
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
                color: 'black'
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
          data: this.shChartData
        }]
      }
    }
  },
  computed: {
    isValid () {
      if (this.pristineForm) {
        return false
      } else {
        return this.formErrors.length === 0
      }
    }
  },
  watch: {
    'lootData': function (value, oldValue) {
      this.pristineForm = false
      if (!value || value === '') {
        this.formErrors.push({ field: 'lootData', error: 'Loot data must be input.' })
      } else {
        this.formErrors = this.formErrors.filter(error => error.field !== 'lootData')
      }
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

          const sharesChart = this.$refs.shChart.getChart()
          const sharesData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.share
            }
          })
          sharesChart.series[0].setData([])
          for (const data of sharesData) {
            sharesChart.series[0].addPoint(data)
          }

          const expChart = this.$refs.xpChart.getChart()
          const experienceData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.experience
            }
          })
          expChart.series[0].setData([])
          for (const data of experienceData) {
            expChart.series[0].addPoint(data)
          }
        })
        .catch(error => {
          this.errors.push(error)
        })
    },
    fieldErrors: function (fieldName) {
      const errors = this.formErrors.filter(error => error.field === fieldName)
      return errors
    },
    submitLootData: function () {
      console.log(`Submitting ${JSON.stringify(this.lootData)}`)
      const body = {
        lootData: this.lootData
      }
      axios.post(`/api/reports/hunts`, body, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then(response => {
          if (response.error) {
            EventBus.$emit('lb-toast-display', { type: 'danger', message: `Unable to store report: ${response.error}` })
          } else {
            EventBus.$emit('lb-toast-display', { type: 'success', message: `Report successfully stored` })
          }
        })
        .catch(error => {
          EventBus.$emit('lb-toast-display', { type: 'danger', message: `Unable to store report: ${error}` })
        })
    }
  }
}
</script>

<style scoped>

</style>
