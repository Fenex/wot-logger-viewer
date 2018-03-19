/**
 * @file manages loading Expended Tank Values (ETV) using JSONP
 *
 * @description
 * All ETV-data were taken out of webpack `require\import` directives,
 * thus we need load files in runtime using `ajax` (XmlHttpRequest).
 * WoTLogger MOD opens GUI window inside client browser via `file://` protocol.
 * So, we can't load JSON files from local file system, but we can use JSONP.
 *
 * Source JSON files that include different versions of an expended tank values
 * located in `etv` directory. There is main file named `source.json`
 * which includes settings for determine available ETV properties
 * after compile project by webpack. During compile webpack (actually
 * `expended-tank-values-plugin` plugin) checks `source.json` and dependencies,
 * converts all necessary json files into JSONP format (JSON wrapped in callback),
 * then copies files to `/static/etv/*` directory with `*.js` extension.
 * Finally, `<script>` tags will be added in main html's `<head>` after a tag
 * that include this script.
 *
 * ETV.apply:
 *  - first call will add converted source.json into ETV.header
 *  - next calls will add converted ETV files into ETV.list
 * ETV.header: converted source.json
 * ETV.list: array of available versions ETV
 *
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

/**
 * TODO:
 * Request ajax to neccessary ETV file in runtime instead of
 * inserting all versions in HTML's header during compile.
 */

var ETV = (function () {
  var _header = null
  var _list = {}

  function apply (json) {
    if (_header === null) {
      _header = json
    } else {
      _list[json.id] = json
    }
  }

  function list () {
    return _list
  }

  function header () {
    return _header
  }

  return {
    apply: apply,
    list: list,
    header: header
  }
})()

// eslint-disable-next-line no-unused-vars
function jsonp_callback (json) {
  typeof json === 'object' && !json.rejected && !json.disabled && ETV.apply(json)
}
