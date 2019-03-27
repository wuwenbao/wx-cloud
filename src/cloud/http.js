/**
 * 打印提示信息
 */
function showToast(msg) {
  wx.showToast({
    icon: 'loading',
    title: msg
  })
}

/**
 * 封装网络请求
 */
class Http {
  constructor(options) {
    if (typeof options === 'string') {
      this.apiRoot = options
    } else if (typeof options === 'object') {
      this.apiRoot = options.api
    } else {
      throw new Error('api root type error!')
    }
    this.hasRetried = false // 是否已经进行过重试
    this.TOKEN = '' // token
    this.OPENID = '' // openid
  }

  /**
   * 设置token
   */
  setToken(token = '') {
    this.TOKEN = token
  }

  /**
   * 发起请求
   */
  request(url, formData, method, header) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.apiRoot + url,
        data: formData,
        header,
        method,
        dataType: 'json',
        responseType: 'text',
        success: res => {
          console.log(`[ 网络请求 ${url} ]: `, res.data)
          resolve(res)
        },
        fail: err => {
          console.log(`[ 网络请求 ${url} 异常 ]: `, err.errMsg)
          reject(err.errMsg)
        }
      })
    })
  }

  /**
   * 发起请求
   */
  Post(url, formData) {
    const retried = res => new Promise((resolve, reject) => {
      if (res.statusCode === 200) {
        if (res.data.code === 0) {
          resolve(res.data)
        } else {
          showToast(res.data.data)
          reject(res.data.data)
        }
      } else if (res.statusCode === 401) {
        // 请求拒绝重连
        if (!this.hasRetried) {
          this.hasRetried = true
          this.wxLogin()
            .then(() => this.Post(url, formData))
            .catch(reject)
        }
      } else {
        showToast('网络异常...')
        reject(new Error('网络异常...'))
      }
    })

    return this.request(url, formData, 'POST', {TOKEN: this.TOKEN}).then(retried)
  }

  /**
   * 微信登录
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (!res.code) {
            reject(new Error('登录失败'))
          }
          this.request('/login', {code: res.code}, {}, 'GET')
            .then(res => {
              if (res.data.data.token) {
                this.setToken(res.data.data.token)
                this.OPENID = res.data.data.openid
                resolve(res.data)
              } else {
                reject(res)
              }
            })
            .catch(reject)
        },
        fail: reject
      })
    })
  }
}

module.exports = Http
