const wxApi = require('./components/index.js')

App({
  onLaunch() {
    console.log(wxApi)
    wx.api = wxApi
    // 直接注入到wx全局变量
    wx.api.init('http://localhost:8080')
  }
})
