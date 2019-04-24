const cloud = require('./cloud')

module.exports = {
  init: options => {
    cloud.init(options)
  },
  callFunction: (url, data) => cloud.callFunction(url, data),
  mock: (...args) => {
    cloud.mock(...args)
  }
}
