---
title: 盒子模型
---

<YouWillLearn isChapter={true}>

[一、盒模型是什么](#一盒模型是什么)
[二、介绍标准模型和 IE 模型，以及他们的区别](#二介绍标准模型和-ie-模型以及他们的区别)
[三、CSS 如何设置盒模型，以及计算对应的宽和高](#三css-如何设置盒模型以及计算对应的宽和高)
[四、js 如何设置获取盒模型对应的宽和高](#四js-如何设置获取盒模型对应的宽和高)
[五、根据盒模型解释边距重叠](#五根据盒模型解释边距重叠)
[六、BFC（边距重叠解决方案，还有 IFC）解决边距重叠](#六bfc边距重叠解决方案还有-ifc解决边距重叠)

</YouWillLearn>

## 一、盒模型是什么

在浏览器审查元素，选择任意标签，点击 Computed 就可以看到下图。

![](/images/docs/css/box/box.jpg)

这就是盒模型。包含 <Font color={'red'}>margin</Font> , <Font color={'red'}>border</Font> ,<Font color={'red'}>padding</Font> , <Font color={'red'}>content</Font> 这四个部分。

> 所有 HTML 元素都可以看作盒子。
>
> 网页页面布局的过程可以看作在页面空间中摆放盒子的过程。通过调整盒子的边框、边界等参数控制各个盒子，实现对整个网页的布局。

## 二、介绍标准模型和 IE 模型，以及他们的区别

它俩的区别就一个，计算宽度（高度）的方式不一样。

### 标准盒模型

![](/images/docs/css/box/standard-box-model.jpg)

<Font color={'red'}> width = content </Font>

- 盒子总宽度 = width + padding + border + margin

- 盒子总高度 = height + padding + border + margin

### IE 盒模型

![](/images/docs/css/box/ie-box-model.jpg)

<Font color={'red'}> width = content + border + padding </Font>

- 盒子总宽度 = width + margin;

- 盒子总高度 = height + margin;

## 三、CSS 如何设置盒模型，以及计算对应的宽和高

CSS 中有一个属性： <Font color={'red'}>box-sizing</Font>,我们可以通过这个属性去设置标准盒模型(`content-box`)或者 IE 盒模型(`border-box`)，默认为标准盒模型。详细参数 [box-sizing](https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-sizing)。

**如何计算元素的宽高？**我们在得知它是哪种盒模型之后就可以依据我们上文的公式去计算了，可以打开 F12，滑到图那里，去查阅该元素四部分（margin、border、padding、content）的值是多少，完后进行计算即可。

## 四、js 如何设置获取盒模型对应的宽和高

### dom.style.width/height

这个方法只能获取写在行内样式中的宽度，写在 style 标签中和使用`link`外链都是获取不到的

```html
<div id="app">this is a div</div>
```

```js
let divWidth = document.getElementById('app').style.width;
console.log(divWidth);
```

```css
#app {
  width: 100px;
  margin-left: 50px;
  border: 25px;
  padding-right: 60px;
  background-color: pink;
}
```

如此之外还有三个 api 可以使用：

- dom.currentStyle.width/height  取到的是最终渲染后的宽和高，只有 IE 支持此属性。
- window.getComputedStyle(dom).width/height  同上一个但是多浏览器支持，IE9 以上支持
- dom.getBoundingClientRect().width/height  也是得到渲染后的宽和高，大多浏览器支持。IE9 以上支持，除此外还可以取到相对于视窗的上下左右的距离。

## 五、根据盒模型解释边距重叠

两个外边距相遇时，它们将形成一个外边框，合并后的外边距高度等于其中最大者。

<Note>
  只有普通文档流中块框的垂直外边距才会发生合并，行内、浮动、绝对定位不会。
</Note>

<Sandpack type='vanilla'>

```html
<div class="div1">这是一个div</div>
<div class="div2">这是一个div</div>
```

```js src/index.js hidden
import './styles.css';
```

```css src/styles.css active
.div1 {
  width: 100px;
  margin: 70px;
  border: 25px;
  padding-right: 60px;
  background-color: pink;
}
.div2 {
  width: 100px;
  margin: 50px;
  border: 25px;
  padding-right: 60px;
  background-color: pink;
}
```

</Sandpack>

产生边距，高度合成最大`70px`。

## 六、BFC（边距重叠解决方案，还有 IFC）解决边距重叠 {/* bfc */}

有些时候我们不希望它发生边距重叠，我们采用 BFC 和 IFC 来解决。

FC 就是 Fomatting Context。它是页面中的一块渲染区域。而且有一套渲染规则，它决定了其子元素将怎样定位。以及和其他元素的关系和相互作用。BFC 和 IFC 都是常见的 FC。 分别叫做 Block Fomatting Context 和 Inline Formatting Context。

以 BFC 为例，来介绍一下它的渲染规则：

- 内部的盒子会在垂直方向上一个接一个的放置
- 对于同一个 BFC 的俩个相邻的盒子的 margin 会发生重叠，与方向无关。
- 每个元素的左外边距与包含块的左边界相接触（从左到右），即使浮动元素也是如此
- BFC 的区域不会与 float 的元素区域重叠
- 计算 BFC 的高度时，浮动子元素也参与计算
- BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素，反之亦然

### BFC 是什么？

首先介绍下文档流

#### 关于文档流

- 普通流
  - 块级元素-单独一行(`<div>、<p>、<h1>-<h6>、<ol>、<ul>、<dl>、<table>、<address>、<blockquote> 、<form>`)
  - 内联元素-拍成一排(`<a>、<span>、<br>、<i>、<em>、<strong>、<label>、<q>、<var>、<cite>、<code>`)
- 定位流
  - `position: ...`
- 浮动流
  - `float: left | right;`

### 怎么触发？

**BFC 的子元素不会对外面的元素产生影响**

#### 开启 BFC 的标志

```
body: BFC元素;
float: left | right; 不为none
overflow: hidden | scroll | auto; 不是 visible;
display: inline-block | table-cell | table-caption | flex | grid; 不为block
position: absolute | fixed; 非 relative;
```

<Sandpack type='vanilla'>

```html
<div class="container"><div class="div1">这是一个div</div></div>
<div class="container"><div class="div2">这是一个div</div></div>
```

```js src/index.js hidden
import './styles.css';
```

```css src/styles.css active
.div1 {
  width: 100px;
  margin: 70px;
  border: 25px;
  padding-right: 60px;
  background-color: pink;
  overflow: hidden;
}
.div2 {
  width: 100px;
  margin: 50px;
  border: 25px;
  padding-right: 60px;
  background-color: pink;
  overflow: hidden;
}
.container {
  overflow: hidden;
}
```

</Sandpack>
