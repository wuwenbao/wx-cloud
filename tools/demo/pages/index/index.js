Page({
  data: {
    userInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.api.callFunction('/openid')
    // 查看是否授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            lang: 'zh_CN',
            withCredentials: true,
            success: res => {
              console.log(res)
              this._getUserInfo(res)
            }
          })
        }
      }
    })
  },

  /**
   * 绑定获取用户信息事件
   */
  bindGetUserInfo(e) {
    console.log(e)
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this._getUserInfo(e.detail)
    }
  },

  /**
   * 公共用户信息处理方法
   */
  _getUserInfo({encryptedData, iv}) {
    wx.showLoading({
      title: '微信登录'
    })

    wx.api
      .callFunction('/user', {
        encryptedData,
        iv
      })
      .then(res => {
        wx.hideLoading()
        this.setData({
          userInfo: res.data
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
  }
})
