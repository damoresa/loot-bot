<template>
  <div class="card">
    <div class="card-header">Hunt detail</div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-12">
          <h5 class="card-title">Details</h5>
        </div>
        <div class="col-md-6">
          <p class="card-text">Code: {{ hunt.code }}</p>
          <p class="card-text" v-if="hunt.displayPinCode">Pin code: {{ hunt.pinCode }}</p>
          <p class="card-text">Loot: {{ hunt.loot }}</p>
          <p class="card-text">Expenses: {{ hunt.expenses }}</p>
          <p class="card-text">Share: {{ hunt.share }}</p>
          <p class="card-text">Status: {{ hunt.paid ? 'Paid' : 'Unpaid' }}</p>
        </div>
        <div class="col-md-6">
          <button type="button" class="btn btn-primary lb-action-btn" v-if="!hunt.displayPinCode" v-on:click="showPinCode()">
            <i class="fa fa-search" aria-hidden="true" ></i>&nbsp;Show pin code
          </button>
          <button type="button" class="btn btn-primary lb-action-btn" v-if="!hunt.paid" v-on:click="submitPaymentData()">
            <i class="fa fa-shopping-cart" aria-hidden="true" ></i>&nbsp;Mark paid
          </button>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-md-6">
          <h5 class="card-title">Reporters</h5>

          <div class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th>Player</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="reporter of hunt.reporters" v-bind:key="reporter.reporter">
                <td>{{ reporter.reporter }}</td>
                <td>{{ reporter.amount }}</td>
                <td>{{ reporter.balance - reporter.amount }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <h5 class="card-title">Monster kills</h5>

          <div class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th>Amount</th>
                <th>Monster</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="monster of hunt.monsters" v-bind:key="monster.name">
                <td>{{ monster.amount }}</td>
                <td>{{ monster.name }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col-md-6">
          <h5 class="card-title">Items looted</h5>

          <div class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th>Amount</th>
                <th>Item</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="item of hunt.items" v-bind:key="item.name">
                <td>{{ item.amount }}</td>
                <td>{{ item.name }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" v-on:click="back">
        <i class="fa fa-arrow-left" aria-hidden="true"></i>&nbsp;Back
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import {getToken} from './../utils/auth'
import {EventBus} from './../utils/bus'

export default {
  name: 'HuntDetail',
  data: function () {
    return {
      hunt: {
        code: '',
        pinCode: '',
        date: '',
        experience: 0,
        loot: 0,
        share: 0,
        expenses: 0,
        paid: false,
        displayPinCode: false,
        items: [],
        monsters: [],
        reporters: []
      },
      errors: []
    }
  },
  created: function () {
    this.loadHunt()
  },
  methods: {
    loadHunt: function () {
      const huntId = this.$route.params.huntId

      axios.get(`/api/reports/hunts/${huntId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then(response => {
          // It's annoying that Axios automatically creates a 'data' node
          const data = response.data
          if (data.data) {
            this.hunt.code = data.data.code
            this.hunt.pinCode = data.data.pinCode
            this.hunt.date = data.data.date
            this.hunt.experience = data.data.experience
            this.hunt.loot = data.data.loot
            this.hunt.share = data.data.share
            this.hunt.expenses = data.data.expenses
            this.hunt.items = data.data.items
            this.hunt.monsters = data.data.monsters
            this.hunt.reporters = data.data.reporters
            this.hunt.paid = data.data.paid
          } else {
            this.errors.push(data.data.error)
          }

          const balanceData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.loot - hunt.expenses
            }
          })
          this.blContainer.series[0].setData(balanceData, true, true)

          const experienceData = this.hunts.map((hunt) => {
            return {
              name: hunt.code,
              y: hunt.experience
            }
          })
          this.xpContainer.series[0].setData(experienceData, true, true)
        })
        .catch(error => {
          this.errors.push(error)
        })
    },
    showPinCode: function () {
      this.hunt.displayPinCode = true
    },
    submitPaymentData: function () {
      const body = {}
      axios.post(`/api/reports/hunts/${this.hunt.code}/paid`, body, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      })
        .then(response => {
          if (response.error) {
            EventBus.$emit('lb-toast-display', { type: 'danger', message: `Unable to mark hunt as paid: ${response.error}` })
          } else {
            EventBus.$emit('lb-toast-display', { type: 'success', message: `Hunt successfully marked as paid` })
            this.loadHunt()
          }
        })
        .catch(error => {
          EventBus.$emit('lb-toast-display', { type: 'danger', message: `Unable to mark hunt as paid: ${error.response.data.error}` })
        })
    },
    back: function () {
      this.$router.push({path: '/hunts'})
    }
  }
}
</script>

<style scoped>

</style>
