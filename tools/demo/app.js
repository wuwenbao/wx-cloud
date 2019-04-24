const wxApi = require('./components/index.js')

App({
  onLaunch() {
    wx.api = wxApi

    // 模拟数据
    wx.api.mock(require('./mock/index'))

    // 直接注入到wx全局变量
    wx.api.init('http://localhost:8080')
  }
})
