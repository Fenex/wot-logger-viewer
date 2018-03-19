/* eslint-disable no-extend-native */

/**
 * equal `str_replace` php function
 * https://stackoverflow.com/questions/5069464/
 *
 * Use:
 * var textarea = $(this).val();
 * var find = ["<", ">", "\n"];
 * var replace = ["&lt;", "&gt;", "<br/>"];
 * textarea = textarea.replaceArray(find, replace);
 */

String.prototype.replaceArray = function (find, replace) {
  var replaceString = this
  var regex
  for (var i = 0; i < find.length; i++) {
    regex = new RegExp(find[i], "g")
    replaceString = replaceString.replace(regex, replace[i])
  }
  return replaceString
}

/* eslint-enable no-extend-native */

export default () => void 0
