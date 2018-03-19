/**
 * @file exports vue-style mixin object
 * @description The function renders cells at the table's header.
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */
export default {
  methods: {
    renderHeader (h, p) {
      let cls = p.column.labelClassName
      const m = cls.match(/cell-([^ ]+)/)

      let _class = {'wl-icon': true}
      _class['wl-icon wl-icon-' + (m ? m[1] : cls)] = true

      const render = h('div', {
        class: _class,
        domProps: {
          innerHTML: '&nbsp;'
        }
      })

      const arg = cls.split(/[- ]/)
      const header = this.$_getHeader(arg[1])
      if (typeof header === 'function') {
        return h('el-tooltip', { }, [
          h('div', {
            slot: 'content'
          }, header(h)),
          render
        ])
      } else {
        return render
      }
    }
  }
}
