var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

var query_cssrltv = utils.convertObj2Query({
  from: 'static',
  to: isProduction
    ? config.build.assetsRelativePath
    : config.dev.assetsRelativePath
})

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction
  }),
  preLoaders: {
    scss: 'cssRelativePathLoader' + query_cssrltv,
    css: 'cssRelativePathLoader' + query_cssrltv
  },
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
