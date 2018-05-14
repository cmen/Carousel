let Encore = require('@symfony/webpack-encore')
const CopyWebpackPlugin = require('copy-webpack-plugin')

Encore
  .setOutputPath('public/build/')
  .setPublicPath('/build')
  .addEntry('js/app', './assets/js/app.js')
  .addStyleEntry('css/app', './assets/css/app.css')
  .enableSourceMaps(!Encore.isProduction())
  .cleanupOutputBeforeBuild()
  .enableBuildNotifications(true, options => {
    options.title = 'Webpack : carousel assets'
  })
  .addPlugin(new CopyWebpackPlugin([
    { from: './assets/images/html', to: 'images' }
  ]))

module.exports = Encore.getWebpackConfig()
