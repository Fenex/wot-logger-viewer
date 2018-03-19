var getOptions = require('loader-utils').getOptions

module.exports = function (content) {
  const options = getOptions(this)
  if (typeof options.from !== 'string' || typeof options.to !== 'string') {
    return content
  }

  // /([:\s]url\s*\()(?:'~relative(\/.+?)'|"~relative(\/.+?)")(\s*\)\s*;?)/g
  var match = new RegExp(
    '([:\\s]url\\s*\\()(?:\'~' + options.from +
    '(\\/.+?)\'|"~' + options.from + '(\\/.+?)")(\\s*\\)\\s*;?)', 'g')

  return content.trim().replace(match, '$1"' + options.to + '$2$3"$4')
}
