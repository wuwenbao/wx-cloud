const Http = require('./http.js')

/**
 * 模拟云开发
 */
class Cloud {
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
    this.http = new Http({api: this.apiRoot})
    this.ctx = this.http.wxLogin()
  }

  /**
   * 云函数
   */
  callFunction(url, data = {}) {
    return this.ctx.then(() => this.http.Post(url, data))
  }

  /**
   * 用户授权操作
   */
  getUserinfo({encryptedData, iv}) {
    return new Promise((resolve, reject) => {
      this.callFunction('/fans', {encryptedData, iv})
        .then(res => {
          this.http.setToken(res.data.token)
          resolve(res)
        })
        .catch(reject)
    })
  }
}

module.exports = new Cloud()
