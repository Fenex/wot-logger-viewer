<!--
The component shows dropdown listbox includes a list of accounts.
-->

<template lang="pug">
  .account-action(v-if="Accounts.length")
    select(v-model="AccountID")
      option(v-for="acc in Accounts" :value="acc.WGid" :key="acc.WGid") {{acc.login}}
</template>

<script>
import WoTDB from '@/services/wotdb'

const LSKey = 'wl-account'

function save (acc_id) {
  localStorage.setItem(LSKey, JSON.stringify(acc_id))
}

function load () {
  return JSON.parse(localStorage.getItem(LSKey) || "null")
}

export default {
  name: 'WlAccount',
  data () {
    return {
      AccountID: void 0,
      Accounts: []
    }
  },
  watch: {
    AccountID (id) {
      if (typeof id === 'number') {
        save(id)
        this.$root.$emit('account-changed', id)
      }
    }
  },
  beforeMount () {
    this.$root.$on('account-changed', id => {
      if (typeof id === 'number' && id !== this.AccountID) {
        save(id)
        init()
      }
    })

    this.AccountID = load()

    const init = () => {
      db.AllAccounts().then(res => {
        this.Accounts = res
        if (!this.AccountID && this.Accounts.length) {
          this.AccountID = this.Accounts[0].WGid
        }
      })
    }

    const db = new WoTDB()
    db.open()
    init()
  }
}
</script>

<style lang="scss">
.account-action {
  float: right;
}
</style>
