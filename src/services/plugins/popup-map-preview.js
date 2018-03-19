import './popup-map-preview.scss'
import Vue from 'vue'
import $ from 'jquery'

var img, popup
const SQUARE = 200
const OFFSET_POPUP = 20
const OFFSET_SQUARE = SQUARE + OFFSET_POPUP + 25

function onMouseMove (e) {
  let offset = e.clientY + OFFSET_SQUARE - window.innerHeight
  if (offset < 0) offset = 0

  popup.show().css({
    top: e.pageY + OFFSET_POPUP - offset,
    left: e.pageX - OFFSET_POPUP - SQUARE
  })
  if (img.attr('src') !== $(e.target).data('src')) {
    img.attr('src', $(e.target).data('src'))
  }
}

function onMouseOut () {
  popup.hide()
}

export default () => {
  img = $('<img>').css({height: SQUARE, width: SQUARE})
  popup = $('<div class="popup-map-preview">')
    .append(img)
    .appendTo($('body'))

  function update (el, binding) {
    var arena = Vue.options.filters['wot-arena-name']
    $(el).data("src", "./static/img/arenas/" + arena(binding.value) + ".png")
  }

  Vue.directive('popup-map-preview', {
    bind (el) {
      $(el).on('mousemove', onMouseMove)
      $(el).on('mouseout', onMouseOut)

      update.apply(this, arguments)
    },
    unbind (el) {
      $(el).off('mousemove', onMouseMove)
      $(el).off('mouseout', onMouseOut)
    },
    update
  })
}
