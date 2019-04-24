# wx-cloud

模拟小程序云开发简单封装（微信的云开发方案限制太多，功能不够完善，不想做小白鼠。。。）

> 使用此组件需要依赖小程序基础库 2.2.1 以上版本，同时依赖开发者工具的 npm 构建。具体详情可查阅[官方 npm 文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)。

## 安装

```bash
npm install --save wx-cloud
```

## 使用

需要和后端一起搭配使用，暂时后端使用 golang 实现，后面会实现 node koa 版本

### 方式 1

```js
//app.js 文件
const api = require("wx-cloud");

App({
  onLaunch: function() {
    api.init("http://localhost:8080");
  }
});

//其他js 文件
const api = require("wx-cloud");

Page({
  onLoad() {
    api
      .callFunction("/user")
      .then(res => {
        //成功处理
      })
      .catch(err => {
        //失败处理
      });
  }
});
```

### 方式 2 wx 全局导入

```js
//app.js 文件
App({
  onLaunch: function() {
    //直接注入到wx全局变量
    wx.api = require("wx-cloud");
    wx.api.init("http://localhost:8080");
  }
});

//其他js 文件
Page({
  onLoad() {
    wx.api
      .callFunction("/user")
      .then(res => {
        //成功处理
      })
      .catch(err => {
        //失败处理
      });
  }
});
```

## Mock

``` js
// 字符串形式
wx.api.mock('/login', {openid: 'openid', token: 'token'}, 0)


// 对象形式
wx.api.mock({
  url: '/login',
  data: {openid: 'openid', token: 'token'},
  code: 0
})

// 数组形式
wx.api.mock([
  {
    url: '/login',
    data: {openid: 'openid', token: 'token'},
    code: 0
  },
  {
    url: '/openid',
    data: {openid: 'openid', token: 'token'},
    code: 0
  }
])
```
