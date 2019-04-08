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
 * 模拟云开发
 */
class Cloud {
  constructor() {
    this.hasRetried = false // 是否已经进行过重试
    this.TOKEN = '' // token
    this.OPENID = '' // openid
    this.REPEAT = false // repeat
    this.IDENT = '微信平台' // 推广标识
    this.SCENE = '' // 推广渠道
  }

  /**
   * 初始化，在app.js里面调用一次就可以了
   */
  init(options) {
    if (typeof options === 'string') {
      this.apiRoot = options
      this.cdnRoot = options
    } else if (typeof options === 'object') {
      this.apiRoot = options.api
      this.cdnRoot = options.cdn
    } else {
      throw new Error('api root type error!')
    }
    this.ctx = this._wxLogin()
  }

  /**
   * 云函数
   */
  callFunction(url, data = {}) {
    return this.ctx.then(() => this._post(url, data))
  }

  /**
   * 用户授权操作
   */
  getUserinfo(encryptedData, iv) {
    return new Promise((resolve, reject) => {
      this.callFunction('/fans', {encryptedData, iv})
        .then(res => {
          this.TOKEN = res.data.token
          this.REPEAT = res.data.repeat
          resolve(res)
        })
        .catch(reject)
    })
  }

  /**
   * 统计
   */
  stat(scene = '') {
    return new Promise((resolve, reject) => {
      this.callFunction('/stat', {scene})
        .then(res => {
          this.IDENT = res.data.ident
          resolve(res)
        })
        .catch(reject)
    })
  }

  /**
   * 发起请求
   */
  _post(url, formData) {
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
          this._wxLogin()
            .then(() => this._post(url, formData))
            .catch(reject)
        } else {
          showToast('拒绝访问...')
          reject(new Error('拒绝访问...'))
        }
      } else {
        showToast('网络异常...')
        reject(new Error('网络异常...'))
      }
    })

    return this._request(url, formData, 'POST', {TOKEN: this.TOKEN}).then(retried)
  }

  /**
   * 发起请求
   */
  _request(url, formData, method, header) {
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
   * 微信登录
   */
  _wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (!res.code) {
            reject(new Error('登录失败'))
          }
          this._request('/login', {code: res.code}, {}, 'GET')
            .then(res => {
              if (res.data.data.token) {
                this.TOKEN = res.data.data.token
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

module.exports = new Cloud()
