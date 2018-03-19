<template lang="pug">
  .create {{time}}
</template>

<script>
export default {
  name: 'cell-create',
  props: ['props'],
  computed: {
    time () {
      return this.props.format('DD.MM HH:mm:ss')
    }
  },
  exports: {
    value (data) {
      return data.create.unix()
    },
    total () {
      return '[avg] OR [avg/sum]'
    }
  },
  components: { }
}
</script>
<style>
.cell .create {
  text-align: center;
}
</style>

