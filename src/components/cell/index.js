/**
 * @file collects and then exports all available cell components
 * and other related functionality
 *
 * @description
 * All types of cells have their own file component.
 * In addition to standard vue component properties,
 * all cell components MUST have `exports` property.
 *
 * The property MUST has `value` function. Also the property
 * MAY include `header` and/or `total` functions.
 *
 * [REQUIRED] `value` function. The return value of the function
 * will be use to sort rows by the column.
 * Structure:
 *  - value(data: Object, key: String|undefined): any
 *    WHERE:
 *    - `data` is a row
 *    - `key` is a second key of a column name (if exists)
 *
 * [OPTIONAL] `total` function. The return value of the function
 * will be show in a total (summary) row below the table. An empty
 * string will be returned if `total` property is not a function.
 * Structure:
 *  - total(array: Array<Object>, key: String|undefined): String
 *    WHERE:
 *    - `array` is an array of all table's rows
 *    - `key` is a second key of a column name (if exists)
 *
 * [OPTIONAL] `header` function is a render function that call for
 * rendering a table's header cell.
 * See https://vuejs.org/v2/guide/render-function.html
 *
 * The key words "MUST", "REQUIRED", "MAY" and "OPTIONAL" in this JSDoc
 * are to be interpreted as described in RFC-2119.
 *
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'
import RenderHeader from "./render-header"
import CellArenaComponent from "./Arena"
import CellKillComponent from "./Kill"
import CellRatingComponent from "./Rating"
import CellVehicleComponent from "./Vehicle"
import CellCreateComponent from "./Create"
import CellSpotComponent from "./Spot"
import CellDmgComponent from "./Dmg"
import CellAssistComponent from "./Assist"

let components = {
  CellArenaComponent,
  CellKillComponent,
  CellRatingComponent,
  CellVehicleComponent,
  CellCreateComponent,
  CellSpotComponent,
  CellDmgComponent,
  CellAssistComponent
}

/**
 * 1. Sets `exports` and `exports.key` props to each cell component
 * 2. Converts `components` object into:
 *
 * {
 *   'cell-${component_name}': CellComponent
 * }
 */
components = _.mapKeys(components, (value, key) => {
  if (!value.exports) value.exports = {}
  if (!value.exports.key) {
    value.key = key
      .match(/^Cell(.+)Component$/)[1]
      .toLocaleLowerCase()
  }

  return 'cell-' + value.key
})

function getValue (columnKey) {
  const exports = components['cell-' + columnKey].exports
  return (typeof exports.value === 'function')
         ? exports.value : a => [a]
}

function calcTotal (columnKey) {
  const exports = components['cell-' + columnKey].exports
  return (typeof exports.total === 'function')
         ? exports.total : () => ''
}

function getHeader (columnKey) {
  const exports = components['cell-' + columnKey].exports
  return (typeof exports.header === 'function')
         ? exports.header : void 0
}

export default {
  Items: components,
  RenderHeader,
  Mixin: {
    methods: {
      $_getValue: getValue,
      $_calcTotal: calcTotal,
      $_getHeader: getHeader
    }
  }
}
