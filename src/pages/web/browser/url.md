---
title: 从输入URL到页面展示到底发生了什么？
---

<Intro>

这个问题综合性非常强，能在其中任何一点上挖出非常多的细节。所以弄明白这个问题是一个循序渐进的过程，本文先弄清整体过程，之后会对整个知识体系做更深的理解。

</Intro>

<YouWillLearn isChapter={true}>

- [网络篇](#网络请求)
- [解析算法篇](#解析算法篇)
- [渲染过程篇](#渲染过程)

</YouWillLearn>

此时，你在浏览器地址栏输入了 GitHub 的网址：

```
https://github.com
```

## 网络篇

### 网络请求

### 1. 构建请求

浏览器回构建请求行：

```
// 请求方法是GET,路径为根目录，HTTP协议版本为1.1
GET / HTTP/1.1
```

### 2. 查找强缓存

先检查强缓存，如果命中直接使用，否则进入下一步。

<LearnMore path="/learn/your-first-component">

阅读更多关于 **[强缓存](/learn/your-first-component)** 的内容

</LearnMore>

### 3. DNS 解析

由于我们输入的是域名，而数据包是通过 <Font color={'red'}>IP 地址</Font> 传给对方。因此我们需要得到的域名对应的 <Font color={'red'}>IP 地址</Font> 。这个过程需要依赖一个服务系统，这个系统将域名和 IP 一一映射，我们将这个系统叫做**DNS**(域名系统)。得到具体 IP 的过程就是 <Font color={'red'}>DNS 解析</Font> 。

当然，值得注意的是，浏览器提供了**DNS 数据缓存功能**。即如果一个域名已经解析过，那会把解析的结果缓存下来，下次处理直接走缓存，不需要经过 <Font color={'red'}>DNS 解析</Font> 。

另外，如果不指定端口的话，默认采用对应的 IP 的 80 端口。

### 4. 建立 TCP 连接

这里要提醒一点，Chrome 在同一个 HOST 下要求同时最多只能有 6 个 TCP 连接，超过 6 个的话剩下的请求就得等待。

假设现在不需要等待，我们进入了 TCP 连接的建立阶段。首先解释一下什么是 TCP：

> TCP（Transmission Control Protocol，传输控制协议）是一种面向连接的、可靠的、基于字节流的传输层通信协议。

建立 <Font color={'red'}>TCP 连接</Font> 经历了下面三个阶段：

1. 通过**三次握手**(即总共发送 3 个数据包确认已经建立连接)建立客户端和服务器之间的连接。
2. 进行数据传输。这里有一个重要的时刻，就是接受方接受到数据包后必须要向发送方 <Font color={'red'}>确认</Font> ，如果发送方没有接到这个 <Font color={'red'}>确认</Font> 的消息，就判定为数据包丢失，并重新发送该数据包。当然，发送的过程中还有一个优化策略，就是把 <Font color={'red'}>大的数据包拆成一个个小包</Font> ，依次传输到接受方，接受方按照这个小包的顺序把他们 <Font color={'red'}>组装</Font> 成完整数据包。
3. 断开连接的阶段。数据传输完成，现在要断开连接了，通过**四次挥手**来断开连接。

至此，TCP 通过上述几个手段来保证数据传输的可靠性，一 <Font color={'red'}>三次握手</Font>确认连接，二 <Font color={'red'}>数据包校验</Font> 保证数据到达接受方，三 <Font color={'red'}>四次挥手</Font> 断开连接。

<LearnMore path="/learn/your-first-component">

更深入的问题，如

- 为什么要三次握手？两次不行吗？
- 第三次握手失败了怎么办？z A
- 为什么要四次挥手？
- 等等

基于此类底层问题， **[点击进入相应的推荐文章](https://zhuanlan.zhihu.com/p/86426969)**

</LearnMore>

### 5. 发送 HTTP 请求

现在 <Font color={'red'}>TCP 连接</Font> 建立完毕，浏览器可以和服务器开始通信，即开始发送 HTTP 请求。浏览器发 HTTP 请求携带三样东西：**请求行、请求头**和**请求体**。

首先，浏览器会想服务器发送**请求行**，关于**请求行**，我们在这一部分的第一步就构建完了，贴一下内容：

```
// 请求方法是GET,路径为根目录，HTTP协议版本为1.1
GET / HTTP/1.1
```

结构很简单，由**请求方法**、**请求 URL**和**HTTP 版本协议**组成。

同时也要带上**请求头**，比如**Cache-Control、If-Modified-Since、If-None-Match**都有可能被放入请求头中作为缓存的标识。当然了还有一些其他的属性，列举如下：

```
:authority: github.com
:method: GET
:path: /
:scheme: https
accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
accept-encoding: gzip, deflate, br
accept-language: zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7
cache-control: max-age=0
cookie:
if-none-match:
sec-ch-ua: " Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "macOS"
sec-fetch-dest: document
sec-fetch-mode: navigate
sec-fetch-site: none
sec-fetch-user: ?1
upgrade-insecure-requests: 1
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36
```

最后是请求体，请求体只有在 <Font color={'red'}>POST</Font> 方法下存在，常见的场景是**表单提交**。

### 网络响应

HTTP 请求到达服务器，服务器进行对应的处理。最后要把数据传给浏览器，也就是返回网络响应。

跟请求部分类似，网络响应具有三个部分：**响应行**、**响应头**和**响应体**。

响应行类似下面这样：

```
HTTP/1.1 200 OK
```

由 <Font color={'red'}>HTTP 协议版本</Font> 、 <Font color={'red'}>状态码</Font> 和 <Font color={'red'}>状态描述</Font> 组成。

响应头包含了服务器及其返回数据的一些信息，服务器生成数据的时间、返回的数据类型以及对即将写入的 Cookie 信息。

举例如下：

```
cache-control: max-age=0, private, must-revalidate
content-encoding: gzip
content-security-policy:
content-type: text/html; charset=utf-8
date: Fri, 11 Feb 2022 16:12:35 GMT
etag: W/"409bb790be4620005791bf5f059e22ae"
expect-ct: max-age=2592000, report-uri="https://api.github.com/_private/browser/errors"
permissions-policy: interest-cohort=()
referrer-policy: origin-when-cross-origin, strict-origin-when-cross-origin
server: GitHub.com
set-cookie: has_recent_activity=1; path=/; expires=Fri, 11 Feb 2022 17:12:35 GMT; secure; HttpOnly; SameSite=Lax
set-cookie:
vary: X-PJAX, X-PJAX-Container
vary: Accept-Encoding, Accept, X-Requested-With
x-content-type-options: nosniff
x-frame-options: deny
x-github-request-id: D95A:776A:194F63:29B778:62068AEE
x-xss-protection: 0
```

相应完成之后怎么办？TCP 连接就断开了吗？

现在浏览器会默认开启 **Connection：Keep-Alive** ,表示建立了持久连接，这样 <Font color={'red'}>TCP</Font> 连接就会一直保持，之后请求统一站点的资源会复用这个连接。

否则断开 <Font color={'red'}>TCP</Font> 连接，请求-响应流程结束。

<LearnMore>

更多内容如下

**[你猜一个 TCP 连接上面能发多少个 HTTP 请求？](https://zhuanlan.zhihu.com/p/61423830)**

</LearnMore>

### 总结

到此，是浏览器端的网络请求过程：

![](/images/docs/url_question/url_net.jpg)

## 解析算法篇

完成了网络请求和响应，如果响应头中 <Font color={'red'}>Content-Type</Font> 的值是 <Font color={'red'}>text/html</Font> ，那么接下来就是浏览器的 <Font color={'red'}>解析过程</Font> 和<Font color={'red'}>渲染</Font>工作了。

首先来介绍解析部分，主要分为以下几个步骤：

- 构建 <Font color={'red'}>DOM</Font> 树
- <Font color={'red'}>样式</Font> 计算
- 生成 <Font color={'red'}>布局树</Font>(<Font color={'red'}>Layout Tree</Font>)

### 构建 DOM 树

由于浏览器无法直接理解 <Font color={'red'}>HTML 字符串</Font>，因此将这一系列的字节流转换成为一种有意义并且方便操作的数据结构，这种数据结构就是 <Font color={'red'}>DOM 树</Font> 。<Font color={'red'}>DOM 树</Font> 本质上是一个以 <Font color={'red'}>document</Font> 为根结点的多叉树。

接下来是解析方法。

### HTML 文法的本质

首先，我们应该清楚把握一点：HTML 的文法并不是 <Font color={'red'}>[上下文无关文法](https://zh.wikipedia.org/wiki/%E4%B8%8A%E4%B8%8B%E6%96%87%E6%97%A0%E5%85%B3%E6%96%87%E6%B3%95)</Font>。

<LearnMore>

了解更多

**[上下文无关文法 wiki](https://zh.wikipedia.org/wiki/%E4%B8%8A%E4%B8%8B%E6%96%87%E6%97%A0%E5%85%B3%E6%96%87%E6%B3%95)**

</LearnMore>

### 解析算法

1. 标记化。
2. 建树。

对应两个过程 **词法分析**和**语法分析**。

### 标记化算法

`<` ,**标记打开**。

接受 <Font color={'red'}>[a-z]</Font>的字符，会进入**标记名称状态**。

保持状态，直到遇到 <Font color={'red'}>&gt;</Font>，表示标记名称记录完成，这时候变成**数据状态**。

回到 <Font color={'red'}>&lt;</Font> ，接收 <Font color={'red'}>\</Font>后，这时候会创建一个 <Font color={'red'}>end tag</Font>的 token。

随后进入**标记名称状态**，遇到 <Font color={'red'}>&gt;</Font>回到**数据状态**。

依次结束。

### 建树算法

之前提过，DOM 树是一个以 <Font color={'red'}>document</Font>为根节点的多叉树。因此解析器首先会创建一个 <Font color={'red'}>document</Font>对象。标记生成器会把每个标记的信息发送给**建树器**。**建树器**接收到相应的标记时，会**创建对应的 DOM 对象**。创建这个**DOM 对象**后会做两件事情。

1. 将 <Font color={'red'}>DOM 对象</Font>加入 DOM 树中。
2. 将对应标记压入存放开放（与 <Font color={'red'}>闭合标签</Font>意思对应）元素的栈中。

举例说明

```html
<html>
  <body>
    Hello World
  </body>
</html>
```

首先，状态为**初始化状态**。

接收到标记生成器传来的 <Font color={'red'}>html</Font> 标签，这时候状态变成**before html 状态**。同时创建一个 `HTMLHtmlElement`的 DOM 元素，将其加到`document`根对象上，并进行压栈操作。

接着状态自动变成为**before head**，此时从标记生成器那边传来 <Font color={'red'}>body</Font>，表示并没有 <Font color={'red'}>head</Font>，这时候**建树器**会自动创建一个**HTMLHeadElement**并将其加入到`DOM 树`中。

现在进入到**in head**状态, 然后直接跳到**after head**。

现在标记生成器传来了 <Font color={'red'}>body</Font>标记，创建**HTMLBodyElement**, 插入到`DOM`树中，同时压入开放标记栈。

接着状态变为 **in body**，然后来接收后面一系列的字符: Hello World。接收到第一个字符的时候，会创建一个 Text 节点并把字符插入其中，然后把 Text 节点插入到 DOM 树中 body 元素的下面。随着不断接收后面的字符，这些字符会附在 Text 节点上。
现在，标记生成器传过来一个 body 的结束标记，进入到 after body 状态。
标记生成器最后传过来一个 html 的结束标记, 进入到 after body 的状态，表示解析过程到此结束。

### 容错机制

`HTML5`有强大的**宽容策略**

下面是 <Font color={'red'}>HTML Parser</Font>容错方面的一些示例。

1. 使用`</br>` 而不是 `<br>`

```cpp
if (t->isCloseTag(brTag) && m_document->inCompatMode()) {
  reportError(MalformedBRError);
  t->beginTag = true;
}
```

### 样式计算

关于 CSS 样式，它的来源一般是三种:

1. **link 标签引用**
2. **style 标签中的样式**
3. **元素的内嵌 style 属性**

### 格式化样式表

首先，浏览器无法直接识别 CSS 样式文本的，因此渲染引擎接收到 CSS 文本之后第一件事就是将其转化为一个结构化的对象，即 styleSheets。

这个格式化的过程过于复杂，而且对于不同的浏览器会有不同的优化策略。

在浏览器控制台能够通过 <Font color={'red'}>document.styleSheets</Font>来查看这个最终的结构。当然，这个结构包含了以上三种 CSS 来源，为后面的样式操作提供了基础。

### 标准化样式属性

有一些 CSS 样式的数值并不容易被渲染引擎所理解，因此需要在计算样式之前将他们标准化，如 <Font color={'red'}>em</Font>-> <Font color={'red'}>px</Font>, <Font color={'red'}>red</Font>-> <Font color={'red'}>#ff0000</Font>, <Font color={'red'}>bold</Font>-> <Font color={'red'}>700</Font>等等。

### 计算每个节点的具体样式

样式已经被 <Font color={'red'}>格式化</Font>和 <Font color={'red'}>标准化</Font>，接下来就可以计算每个节点的具体样式信息了。

其实计算的方式也并不复杂，主要就是两个规则：**继承**和**层叠**。

每个字节点都会默认继承父节点的样式属性，如果父节点中没有找到，就会采用浏览器默认样式，也叫 <Font color={'red'}>UserAgent 样式</Font>。这就是继承规则。

然后就是层叠规则，CSS 最大的特点在于它的层叠性，也就是最终的样式取决于各个属性共同作用的效果，甚至有很多诡异的层叠现象，看过《CSS 世界》的同学应该对此深有体会，具体的层叠规则属于深入 CSS 语言的范畴，这里就不过多介绍了。

不过值得注意的是，在计算完样式之后，所有的样式值会被挂在到 [window.getComputedStyle](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getComputedStyle)当中，也就是可以通过 JS 来获取计算后的样式，非常方便。

### 生成布局树

现在已经生成了 <Font color={'red'}>DOM 树</Font>和 <Font color={'red'}>DOM 样式</Font>，接下来要做的就是通过浏览器的布局系统 <Font color={'red'}>确定元素的位置</Font>，也就是要生成一棵 <Font color={'red'}>布局树</Font>(Layout Tree)。

布局树生成的大致工作如下：

1. 遍历生成的 DOM 树节点，并把他们添加到 <Font color={'red'}>布局树中</Font>。
2. 计算布局树节点的坐标位置。

值得注意的是，这棵布局树值包含可见元素，对于 head 标签和设置了 display: none 的元素，将不会被放入其中。

有人说首先会生成 <Font color={'red'}>Render Tree</Font>，也就是渲染树，其实这还是 16 年之前的事情，现在 Chrome 团队已经做了大量的重构，已经没有生成 <Font color={'red'}>Render Tree</Font> 的过程了。而布局树的信息已经非常完善，完全拥有 <Font color={'red'}>Render Tree</Font> 的功能。

之所以不讲布局的细节，是因为它过于复杂，一一介绍会显得文章过于臃肿，不过大部分情况下我们只需要知道它所做的工作**是什么**即可，如果想深入其中的原理，知道它是**如何来做**的，我强烈推荐你去读一读人人 FED 团队的文章[从 Chrome 源码看浏览器如何 layout 布局](https://www.rrfed.com/2017/02/26/chrome-layout/)。

### 总结

![](/images/docs/url_question/url_dom.jpg)

## 渲染过程

渲染过程分为以下几个步骤：

- 建立 <Font color={'red'}>图层树（Layout Tree）</Font>
- 生成 <Font color={'red'}>绘制列表</Font>
- 生成 <Font color={'red'}>图块</Font>并 <Font color={'red'}>栅格化</Font>
- 显示器显示内容

### 一、建图层树

除了 DOM 节点，样式，位置信息，还有一些复杂场景，比如 3D 动画如何呈现出变换效果，当元素含有层叠上下文时如何控制显示和隐藏等等。

为了处理上述问题，浏览器在构建完 <Font color={'red'}>布局树</Font>之后，还会对特定的节点进行分层，构建一棵 <Font color={'red'}>涂层树（Layout Tree）</Font>。

那这颗图层树是根据什么来构建的呢？

一般情况下，节点的图层会默认属于父亲节点的图层(这些图层也称为**合成层**)。那什么时候会提升为一个单独的合成层呢？

有两种情况需要分别讨论，一种是**显式合成**，一种是**隐式合成**。

### 显式合成

#### 一、拥有层叠上下文的节点。

层叠上下文也基本上是有一些特定的 CSS 属性创建的，一般有以下情况：

> 1. HTML 根元素本身就具有层叠上下文。
> 2. 普通元素设置 position 不为 static 并且**设置了 z-index 属性**，会产生层叠上下文。
> 3. 元素的 opacity 值不是 1
> 4. 元素的 transform 值不是 none
> 5. 元素的 filter 值不是 none
> 6. 元素的 isolation 值是 isolate
> 7. will-change 指定的属性值为上面任意一个。(will-change 的作用后面会详细介绍)

#### 二、需要剪裁的地方。

比如一个 div，你只给他设置 100 \* 100 像素的大小，而你在里面放了非常多的文字，那么超出的文字部分就需要被剪裁。当然如果出现了滚动条，那么滚动条会被单独提升为一个图层。

### 隐式合成

接下来是隐式合成，简单来说就是层叠等级低的节点被提升为单独的图层之后，那么所有层叠等级比它高的节点都会成为一个单独的图层。

这个隐式合成其实隐藏着巨大的风险，如果在一个大型应用中，当一个 z-index 比较低的元素被提升为单独图层之后，层叠在它上面的的元素统统都会被提升为单独的图层，可能会增加上千个图层，大大增加内存的压力，甚至直接让页面崩溃。这就是层爆炸的原理。这里有一个具体的例子，[点击打开](https://segmentfault.com/a/1190000014520786)。

值得注意的是，当需要 repaint 时，只需要 repaint 本身，而不会影响到其他的层。

### 二、生成绘制列表

接下来渲染引擎会将图层的绘制拆分成一个个绘制指令，比如先画背景、再描绘边框......然后将这些指令按顺序组合成一个待绘制列表，相当于给后面的绘制操作做了一波计划。

这里我以百度首页为例，大家可以在 Chrome 开发者工具中在设置栏中展开 more tools, 然后选择 Layers 面板，就能看到下面的绘制列表:

![](/images/docs/url_question/baidu_chrome_layers.jpg)

### 三、生成图片和生成位图

现在开始绘制操作，实际上在渲染进程中绘制操作是由专门的线程来完成的，这个线程叫**合成线程**。

绘制列表准备好了之后，渲染进程的主线程会给 <Font color={'red'}>合成线程</Font> 发送 <Font color={'red'}>commit</Font> 消息，把绘制列表提交给合成线程。接下来就是合成线程一展宏图的时候啦。

首先，考虑到视口就这么大，当页面非常大的时候，要滑很长时间才能滑到底，如果要一口气全部绘制出来是相当浪费性能的。因此，合成线程要做的第一件事情就是将图层**分块**。这些块的大小一般不会特别大，通常是 256 _ 256 或者 512 _ 512 这个规格。这样可以大大加速页面的首屏展示。

因为后面图块数据要进入 GPU 内存，考虑到浏览器内存上传到 GPU 内存的操作比较慢，即使是绘制一部分图块，也可能会耗费大量时间。针对这个问题，Chrome 采用了一个策略: 在首次合成图块时只采用一个低分辨率的图片，这样首屏展示的时候只是展示出低分辨率的图片，这个时候继续进行合成操作，当正常的图块内容绘制完毕后，会将当前低分辨率的图块内容替换。这也是 Chrome 底层优化首屏加载速度的一个手段。

顺便提醒一点，渲染进程中专门维护了一个栅格化线程池，专门负责把图块转换为位图数据。

然后合成线程会选择视口附近的图块，把它交给栅格化线程池生成位图。

生成位图的过程实际上都会使用 GPU 进行加速，生成的位图最后发送给合成 <Font color={'red'}>线程</Font> 。

### 四、显示器显示内容

栅格化操作完成后，合成线程会生成一个绘制命令，即"DrawQuad"，并发送给浏览器进程。

浏览器进程中的 <Font color={'red'}>viz</Font> 组件接收到这个命令，根据这个命令，把页面内容绘制到内存，也就是生成了页面，然后把这部分内存发送给显卡。为什么发给显卡呢？我想有必要先聊一聊显示器显示图像的原理。

无论是 PC 显示器还是手机屏幕，都有一个固定的刷新频率，一般是 60 HZ，即 60 帧，也就是一秒更新 60 张图片，一张图片停留的时间约为 16.7 ms。而每次更新的图片都来自显卡的前缓冲区。而显卡接收到浏览器进程传来的页面后，会合成相应的图像，并将图像保存到后缓冲区，然后系统自动将 <Font color={'red'}>前缓冲区</Font> 和 <Font color={'red'}>后缓冲区</Font> 对换位置，如此循环更新。

看到这里你也就是明白，当某个动画大量占用内存的时候，浏览器生成图像的时候会变慢，图像传送给显卡就会不及时，而显示器还是以不变的频率刷新，因此会出现卡顿，也就是明显的掉帧现象。

### 总结

到这里，我们算是把整个过程给走通了，现在重新来梳理一下页面渲染的流程。

![](/images/docs/url_question/url_draw.jpg)

### 结尾

- [文章原文](https://juejin.cn/post/6844904021308735502)
- [类似文章](https://zhuanlan.zhihu.com/p/133906695)
