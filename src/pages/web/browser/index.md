---
title: 浏览器内容
---

## 常见的浏览器

浏览器是网页运行的平台，常见的浏览器有谷歌（Chrome）、Safari、火狐（Firefox）、IE、Edge、Opera 等。

我们重点需要学习的是 Chrome 浏览器。

## 浏览器的市场占有份额

[百度统计浏览器市场份额](https://tongji.baidu.com/research/site?source=index#browser)

## 浏览器的组成

浏览器分成两部分：

1、渲染引擎（即：浏览器内核）
2、JS 引擎

最开始渲染引擎和 JS 引擎并没有区分的很明确，后来 JS 引擎越来越独立，内核就倾向于只指渲染引擎。

### 1、渲染引擎（浏览器内核）

浏览器所采用的「渲染引擎」也称之为「浏览器内核」，用来解析 HTML 与 CSS。渲染引擎决定了浏览器如何显示网页的内容以及页面的格式信息。

**渲染引擎是浏览器兼容性问题出现的根本原因。**

渲染引擎的英文叫做 Rendering Engine。通俗来说，它的作用就是：负责取得网页的内容（ HTML、图像等 ）、整理讯息（ CSS 引入等 ）及计算网页的显示方式，然后输出至显示器或打印机。

「 工作原理 」浏览器内核的不同对于网页的语法解释会有不同，所以，渲染的效果也不相同。

- Trident _ IE // EdgeHTML _ Edge
  国内很多的双核浏览器的其中一核便是 Trident，美其名曰“兼容模式”。
  代表：IE、傲游、世界之窗、Avant、腾讯 TT、猎豹安全浏览器、360 极速浏览器、百度浏览器等。
  Window10 发布后，IE 将其内置浏览器命名为 Edge，Edge 最显著的特点就是新内核 EdgeHTML。

- Gecko \_ Firefox
  Mizilla FireFox（ 火狐浏览器 ）采用该内核，Gecko 的特点是代码完全公开，
  因此，其可开发程度很高，全世界的程序员都可以为其编写代码，增加功能。
  但这几年已没落，原因诸如：打开速度慢、升级频繁、猪一样的队友 flash、神一样的对手 Chrome。

- webkit \_ Safari
  Safari 是苹果公司开发的浏览器，所用浏览器内核的名称是大名鼎鼎的 webkit。
  现在很多人错误的把 webkit 叫做 Chrome 内核（ 即使 Chrome 内核已经是 blink 了 ），苹果感觉像被抢了媳妇。
  代表：傲游浏览器 3、Apple Safari（ Win/Mac/iphone/iPad ）、Symbian 手机浏览器、Android 默认浏览器。

- Chromlum / Blink \_ Chrome
  2013 年 4 月 3 日，谷歌正式宣布和 webkit “离婚”。Chromium 项目研发的 Blink 渲染引擎（ 即，浏览器内核 ），内置于 Chrome 浏览器中。Blink 其实是 Webkit 的分支，大部分国产浏览器最新版都采用 Blink 内核。

- Presto \_ Opera
  Presto（ 已废弃 ）是 Opera 浏览器的“前任”内核，而最新的 Opera 浏览器早已将之抛弃而投入到谷歌的怀抱了。

- 移动端
  移动端的浏览器内核主要说的是系统内置浏览器的内核。
  目前移动设备浏览器上常用的内核有 Webkit、Blink、Trident、Gecko 等，其中 iPhone 和 iPad 等苹果 IOS 平台主要是 Webkit，Android4.4 之前的 Android 系统浏览器内核是 Webkit，Android4.4 系统浏览器切换到了 Chromium，内核是 Webkit 的分支 Blink，Windows Phone 8 系统浏览器内核是 Trident。

### 2. JavaScript 引擎

也称为 JS 解释器。 用来解析网页中的 JavaScript 代码，对其处理后再运行。

浏览器本身并不会执行 JS 代码，而是通过内置 JavaScript 引擎(解释器) 来执行 JS 代码 。JS 引擎执行代码时会逐行解释每一句源码（转换为机器语言），然后由计算机去执行。所以 JavaScript 语言归为脚本语言，会逐行解释执行。

> 老版本 IE 使用 Jscript 引擎
>
> IE9 之后使用 Chakra 引擎
>
> edge 浏览器仍然使用 Chakra 引擎
>
> firefox 使用 monkey 系列引擎
>
> safari 使用的 SquirrelFish 系列引擎
>
> Opera 使用 Carakan 引擎
>
> chrome 使用 V8 引擎。nodeJs 其实就是封装了 V8 引擎
