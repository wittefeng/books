---
title: 跨域
---

<Intro>老生常谈，需要掌握的基础知识。</Intro>

<YouWillLearn>

这里采用 <Font color={'red'}>What-How-Why</Font> 的方式尽可能的去总结网络上的跨域方案。

其中 How(以下)为解决跨域方案。

[1. CORS](#1-cors)
[2. Node 中间件代理](#2-node-中间件代理)
[3. Nginx 反向代理](#3-nginx-反向代理)
[4. JSONP](#4-jsonp)
[5. websocket](#5-websocket)
[6. window.postMessage](#6-windowpostmessage)
[7. document.domain + Iframe](#7-documentdomain--iframe)
[8. window.location.hash + Iframe](#8-windowlocationhash--iframe)
[9. window.name + Iframe](#9-windowname--iframe)

</YouWillLearn>

## What 跨域是什么？

浏览器的**同源策略**！

> -- MDN
>
> Web 内容的源由用于访问它的 [URL](https://developer.mozilla.org/zh-CN/docs/Glossary/URL) 的方案(协议)，主机(域名)和端口定义。只有当方案，主机和端口都匹配时，两个对象具有相同的起源。
>
> 某些操作仅限于同源内容，而可以使用 [CORS](https://developer.mozilla.org/zh-CN/docs/Glossary/CORS) 解除这个限制。

下表给出了与 URL `http://store.company.com/dir/page.html` 的源进行对比的示例:

| URL                                               | 结果 |               原因                |
| :------------------------------------------------ | :--: | :-------------------------------: |
| `http://store.company.com/dir2/other.html`        | 同源 |           只有路径不同            |
| `http://store.company.com/dir/inner/another.html` | 同源 |           只有路径不同            |
| `https://store.company.com/secure.html`           | 失败 |             协议不同              |
| `http://store.company.com:81/dir/etc.html`        | 失败 | 端口不同 ( http:// 默认端口是 80) |
| `http://news.company.com/dir/other.html`          | 失败 |             主机不同              |

只有当协议、域名、端口全部一致，才算同源。

## How 怎么解决跨域呢？

### 1. CORS

**什么情况下需要 CORS ？**

- 由 XMLHttpRequest 或 Fetch APIs 发起的跨源 HTTP 请求。
- Web 字体 (CSS 中通过 @font-face 使用跨源字体资源)，因此，网站就可以发布 TrueType 字体资源，并只允许已授权网站进行跨站调用。
- WebGL 贴图
- 使用 drawImage 将 Images/video 画面绘制到 canvas。
- 来自图像的 CSS 图形

**CORS 概述**

跨源资源共享标准 (CORS) 新增了一组 HTTP 首部字段，允许服务器声明哪些源站通过浏览器有权限访问哪些资源。

浏览器会自动进行 CORS 通信，实现 CORS 通信的关键是后端。只要后端实现了 CORS，就实现了跨域。

服务端设置 Access-Control-Allow-Origin 就可以开启 CORS。 该属性表示哪些域名可以访问资源，如果设置通配符则表示所有网站都可以访问资源。

虽然设置 CORS 和前端没什么关系，但是通过这种方式解决跨域问题的话，会在发送请求时出现两种情况，分别为简单请求和复杂请求。

> **「浏览器支持情况」**
>
> CORS 需要浏览器和后端同时支持。当你使用 IE<=9, Opera<12, or Firefox<3.5 或者更加老的浏览器，这个时候请使用 JSONP 。

#### 简单请求

不会触发 CORS 预检请求。这样的请求为“简单请求”，请注意，该术语并不属于 Fetch （其中定义了 CORS）规范。若请求满足所有下述条件，则该请求可视为“简单请求”：

情况一: 使用以下方法(意思就是以下请求以外的都是非简单请求)

- GET
- HEAD
- POST

情况二: 人为设置以下集合外的请求头

- Accept
- Accept-Language
- Content-Language
- Content-Type （需要注意额外的限制）
- DPR
- Downlink
- Save-Data
- Viewport-Width
- Width

情况三：Content-Type 的值仅限于下列三者之一：(例如 application/json 为非简单请求)

- text/plain
- multipart/form-data
- application/x-www-form-urlencoded

情况四:

请求中的任意 <Font color={'red'}>XMLHttpRequestUpload</Font> 对象均没有注册任何事件监听器； <Font color={'red'}>XMLHttpRequestUpload</Font> 对象可以使用 <Font color={'red'}>XMLHttpRequest.upload</Font> 属性访问。

情况五:

请求中没有使用 <Font color={'red'}>ReadableStream</Font> 对象。

#### 非简单请求

在复杂请求的 CORS 请求，会在正式通信之前，增加一次 HTTP 查询请求，成为“预检”请求，该请求时 option 方法的，通过该请求来知道服务端是否允许跨域请求。

例如我们使用 <Font color={'red'}>PUT</Font> 向后抬请求时，属于复杂请求，后台需做如下配置：

```js {14-16}
// 设置哪个源可以访问我
res.setHeader('Access-Control-Allow-Origin', origin);
// 允许携带哪个头访问我
res.setHeader('Access-Control-Allow-Headers', 'name');
// 允许哪个方法访问我
res.setHeader('Access-Control-Allow-Methods', 'PUT');
// 允许携带cookie
res.setHeader('Access-Control-Allow-Credentials', true);
// 预检的存活时间
res.setHeader('Access-Control-Max-Age', 6);
// 允许返回的头
res.setHeader('Access-Control-Expose-Headers', 'name');
// OPTIONS请求不做任何处理
if (req.method === 'OPTIONS') {
  res.end();
}
// 定义后台返回的内容
app.put('/getData', function (req, res) {
  console.log(req.headers);
  res.end('von');
});
```

#### Node 中的解决方案

**原生方式**

我们来看下后端部分的解决方案。`Node` 中 `CORS` 的解决代码.

```js
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', ctx.headers.origin);
  ctx.set('Access-Control-Allow-Credentials', true);
  ctx.set('Access-Control-Request-Method', 'PUT,POST,GET,DELETE,OPTIONS');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, cc'
  );
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  await next();
});
```

**第三方中间件**

为了方便也可以直接使用中间件

```js
const cors = require('koa-cors');
app.use(cors());
```

[更多内容，在 MDN CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)

### 2. Node 中间件代理

实现原理：**同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略**。代理服务器，需要做以下几个步骤：

- 接受客户端请求。
- 将请求转发给服务器。
- 拿到服务器响应数据。
- 将响应转发给客户端。

#### cli 工具中的代理

#### 1. webpack

```js
// webpack.config.js
module.exports = {
  //...
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: {'^/api': ''},
      },
    },
  },
};
```

```js
// 业务页面
axios.get('/api/corslist').then((res) => {
  console.log(res.data);
});
```

[webpack proxy 官方文档](https://webpack.docschina.org/configuration/dev-server/#devserverproxy)

#### 2. vue-cli

```js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: '<url>',
        ws: true,
        changeOrigin: true,
      },
      '/foo': {
        target: '<other_url>',
      },
    },
  },
};
```

[vue-cli proxy 官方文档](https://cli.vuejs.org/zh/config/#devserver-proxy)

### 3. nginx 反向代理

实现原理类似于 Node 中间件代理，需要你搭建一个中转 nginx 服务器，用于转发请求。

使用 nginx 反向代理实现跨域，是最简单的跨域方式。只需要修改 nginx 的配置即可解决跨域问题，支持所有浏览器，支持 session，不需要修改任何代码，并且不会影响服务器性能。

实现思路：通过 nginx 配置一个代理服务器（域名与 domain1 相同，端口不同）做跳板机，反向代理访问 domain2 接口，并且可以顺便修改 cookie 中 domain 信息，方便当前域 cookie 写入，实现跨域登录。

先下载 nginx，然后将 nginx 目录下的 nginx.conf 修改如下:

```
// proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;
    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;

        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}

```

### 4. JSONP

#### 原理

利用 <Font color={'red'}><script\></Font> 标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的 JSON 数据。JSONP 请求一定需要对方的服务器做支持才可以。

#### 优缺点

JSONP 优点是简单兼容性好，可用于解决主流浏览器的跨域数据访问的问题。**缺点是仅支持 get 方法具有局限性,不安全可能会遭受 XSS 攻击**。

#### 实现流程

- 声明一个回调函数，其函数名(如 show)当做参数值，要传递给跨域请求数据的服务器，函数形参为要获取目标数据(服务器返回的 data)。

- 创建一个<Font color={'red'}><script\></Font>标签，把那个跨域的 API 数据接口地址，赋值给 script 的 src,还要在这个地址中向服务器传递该函数名（可以通过问号传参:?callback=show）。

- 服务器接收到请求后，需要进行特殊的处理：把传递进来的函数名和它需要给你的数据拼接成一个字符串,例如：传递进去的函数名是 show，它准备好的数据是 show('msg')。

- 最后服务器把准备的数据通过 HTTP 协议返回给客户端，客户端再调用执行之前声明的回调函数（show），对返回的数据进行操作。

在开发中可能会遇到多个 JSONP 请求的回调函数名是相同的，这时候就需要自己封装一个 JSONP 函数。

```js
// index.html
function jsonp({url, params, callback}) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    window[callback] = function (data) {
      resolve(data);
      document.body.removeChild(script);
    };
    params = {...params, callback}; // wd=params&callback=show
    let arrs = [];
    for (let key in params) {
      arrs.push(`${key}=${params[key]}`);
    }
    script.src = `${url}?${arrs.join('&')}`;
    document.body.appendChild(script);
  });
}
jsonp({
  url: 'http://localhost:3000/jsonp',
  params: {wd: 'params'},
  callback: 'show',
}).then((data) => {
  console.log(data);
});
```

上面这段代码相当于向`http://localhost:3000/say?wd=Iloveyou&callback=show`这个地址请求数据，然后后台返回`show('server data')`，最后会运行 show()这个函数，打印出'server data'

```js
// server.js
let express = require('express');
let app = express();
app.get('/say', function (req, res) {
  let {wd, callback} = req.query;
  console.log(wd); // params
  console.log(callback); // show
  res.end(`${callback}('server data')`);
});
app.listen(3000);
```

JQuery Ajax 示例

```html
<script src="https://cdn.bootcss.com/jquery/3.5.0/jquery.min.js"></script>
<script>
  $.ajax({
    url: 'http://localhost:8080/api/jsonp',
    dataType: 'jsonp',
    type: 'get', //可以省略
    data: {
      msg: 'hello',
    },
    jsonpCallback: 'show', //->自定义传递给服务器的函数名，而不是使用jQuery自动生成的，可省略
    jsonp: 'callback', //->把传递函数名的那个形参callback，可省略
    success: function (data) {
      console.log(data);
    },
  });
</script>
```

### 5. websocket

Websocket 是 HTML5 的一个持久化的协议，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案。WebSocket 和 HTTP 都是应用层协议，都基于 TCP 协议。但是 **WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据**。同时，WebSocket 在建立连接时需要借助 HTTP 协议，连接建立好了之后 client 与 server 之间的双向通信就与 HTTP 无关了。

代码示例

```html
<!-- 前端部分 -->
<script>
  let socket = new WebSocket('ws://localhost:8080');
  socket.onopen = function () {
    socket.send('data');
  };
  socket.onmessage = function (e) {
    console.log(e.data);
  };
</script>
```

```js
// 后端部分
const WebSocket = require('ws');
const server = new WebSocket.Server({port: 8080});
server.on('connection', function (socket) {
  socket.on('message', function (data) {
    socket.send(data);
  });
});
```

### 6. window.postMessage

`window.postMessage()` 方法可以安全地实现跨源通信。通常，对于两个不同页面的脚本，只有当执行它们的页面位于具有相同的协议（通常为 https），端口号（443 为 https 的默认值），以及主机 (两个页面的模数 Document.domain 设置为相同的值) 时，这两个脚本才能相互通信。`window.postMessage()` 方法提供了一种受控机制来规避此限制，只要正确的使用，这种方法就很安全。

#### 用途

1.页面和其打开的新窗口的数据传递

2.多窗口之间消息传递

3.页面与嵌套的 iframe 消息传递

#### 用法

[详细用法看](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

<Font color={'red'}>
  otherWindow.postMessage(message, targetOrigin, [transfer]);
</Font>

- otherWindow: 其他窗口的一个引用，比如 iframe 的 contentWindow 属性、执行 window.open 返回的窗口对象、或者是命名过或数值索引的 window.frames。

- message: 将要发送到其他 window 的数据。

- targetOrigin: 通过窗口的 origin 属性来指定哪些窗口能接收到消息事件.

- transfer(可选) : 是一串和 message 同时传递的 <Font color={'red'}>Transferable</Font> 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权

#### 示例

```html
<iframe
  src="http://localhost:8080"
  frameborder="0"
  id="iframe"
  onload="load()"></iframe>
<script>
  function load() {
    iframe.contentWindow.postMessage('fw', 'http://localhost:8080');
    window.onmessage = (e) => {
      console.log(e.data);
    };
  }
</script>
```

```html
<div>hello</div>
<script>
  window.onmessage = (e) => {
    console.log(e.data); //fw.source.postMessage(e.data, e.origin);
  };
</script>
```

### 7. document.domain + Iframe

该方式只能用于二级域名相同的情况下，比如 a.test.com 和 b.test.com 适用于该方式。只需要给页面添加 document.domain ='test.com' 表示二级域名都相同就可以实现跨域。

实现原理：两个页面都通过 js 强制设置 document.domain 为基础主域，就实现了同域。

我们看个例子：页面 a.zf1.cn:3000/a.html 获取页面 b.zf1.cn:3000/b.html 中 a 的值

```html
// a.html
<body>
  helloa
  <iframe
    src="http://b.zf1.cn:3000/b.html"
    frameborder="0"
    onload="load()"
    id="frame"></iframe>
  <script>
    document.domain = 'zf1.cn';
    function load() {
      console.log(frame.contentWindow.a);
    }
  </script>
</body>
```

```html
// b.html
<body>
  hellob
  <script>
    document.domain = 'zf1.cn';
    var a = 100;
  </script>
</body>
```

### 8. window.location.hash + Iframe

实现原理： a.html 欲与 c.html 跨域相互通信，通过中间页 b.html 来实现。 三个页面，不同域之间利用 iframe 的 location.hash 传值，相同域之间直接 js 访问来通信。

具体实现步骤：一开始 a.html 给 c.html 传一个 hash 值，然后 c.html 收到 hash 值后，再把 hash 值传递给 b.html，最后 b.html 将结果放到 a.html 的 hash 值中。同样的，a.html 和 b.html 是同域的，都是 http://localhost:3000;而 c.html 是 http://localhost:4000

```html
// a.html
<iframe src="http://localhost:4000/c.html#iloveyou"></iframe>
<script>
  window.onhashchange = function () {
    //检测hash的变化
    console.log(location.hash);
  };
</script>
```

```html
// b.html
<script>
  // b.html将结果放到a.html的hash值中，b.html可通过parent.parent访问a.html页面
  window.parent.parent.location.hash = location.hash;
</script>
```

```js
// c.html
console.log(location.hash);
let iframe = document.createElement('iframe');
iframe.src = 'http://localhost:3000/b.html#idontloveyou';
document.body.appendChild(iframe);
```

### 9. window.name + Iframe

window.name 属性的独特之处：name 值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。

其中 a.html 和 b.html 是同域的，都是 http://localhost:3000;而 c.html 是 http://localhost:4000

```html
// a.html(http://localhost:3000/b.html)
<iframe
  src="http://localhost:4000/c.html"
  frameborder="0"
  onload="load()"
  id="iframe"></iframe>
<script>
  let first = true;
  // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
  function load() {
    if (first) {
      // 第1次onload(跨域页)成功后，切换到同域代理页面
      let iframe = document.getElementById('iframe');
      iframe.src = 'http://localhost:3000/b.html';
      first = false;
    } else {
      // 第2次onload(同域b.html页)成功后，读取同域window.name中数据
      console.log(iframe.contentWindow.name);
    }
  }
</script>
```

b.html 为中间代理页，与 a.html 同域，内容为空。

```html
// c.html(http://localhost:4000/c.html)
<script>
  window.name = '我不爱你';
</script>
```

## Why 为什么需要跨域？

在最一开始，我们知道了，跨域只存在于浏览器端。而浏览器为 web 提供访问入口。我们在可以浏览器内打开很多页面。正是这样的开放形态，所以我们需要对他有所限制。就比如林子大了，什么鸟都有，我们需要有一个统一的规范来进行约定才能保障这个安全性。

### 1.限制不同源的请求

这里还是用最常用的方式来讲解，例如用户登录 a 网站，同时新开 tab 打开了 b 网站，如果不限制同源， b 可以像 a 网站发起任何请求，会让不法分子有机可趁。

### 2.限制 dom 操作

我举个例子吧, 你先登录下 www.baidu.com ,然后访问我这个网址。再嵌套 baidu iframe，进行 dom 操作，就...

<Recap>

- CORS 支持所有类型的 HTTP 请求，是跨域 HTTP 请求的根本解决方案
- JSONP 只支持 GET 请求，JSONP 的优势在于支持老式浏览器，以及可以向不支持 CORS 的网站请求数据。
- 不管是 Node 中间件代理还是 nginx 反向代理，主要是通过同源策略对服务器不加限制。
- 日常工作中，用得比较多的跨域方案是 cors 和 nginx 反向代理

</Recap>
