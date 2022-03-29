---
title: React 中的 ErrorBoundary 有那些使用场景
---

<Intro>
  是 react 内的一个钩子，用于在组件内发生了 js 错误时候的错误处理。
  使用场景是在发生 js
  报错的时候不至于说白屏，可以转去别的页面提示用户这里报了错，转用别的去到去继续操作。
</Intro>

## 背景

浏览器中部分 UI 的 JavaScript 错误会导致整个应用崩溃，为了解决这个问题，React 16 引入了一个新的概念——错误边界。

错误边界是一种 React 组件，这种组件**可以捕获发生在其子组件树任何未知的 JavaScript 错误，并打印这些错误，同时展示降级 UI**，而并不会渲染那些发生崩溃的子组件树。错误边界可以捕获发生在整个子组件树的渲染期间、生命周期方法以及构造函数中的错误。

<Note >

**注意**
错误边界**无法**捕获一下场景中产生的错误：

- 事件处理
- 异步代码（例如 setTimeout 或 requestAnimationFrame 回调函数）
- 服务端渲染
- 它自身抛出来的错误（并非它的子组件）

</Note>

<Sandpack >

```js index.js active
import './styles.css';
import {render} from 'react-dom';
import App from './App.js';

render(<App />, document.getElementById('root'));
```

```js App.js
import * as React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: null, errorInfo: null};
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{whiteSpace: 'pre-wrap'}}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

class BuggyCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {counter: 0};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(({counter}) => ({
      counter: counter + 1,
    }));
  }

  render() {
    if (this.state.counter === 5) {
      // Simulate a JS error
      throw new Error('I crashed!');
    }
    return <h1 onClick={this.handleClick}>{this.state.counter}</h1>;
  }
}
export default function App() {
  return (
    <div>
      <p>
        <b>
          This is an example of error boundaries in React 16.
          <br />
          <br />
          Click on the numbers to increase the counters.
          <br />
          The counter is programmed to throw when it reaches 5. This simulates a
          JavaScript error in a component.
        </b>
      </p>
      <hr />
      <ErrorBoundary>
        <p>
          These two counters are inside the same error boundary. If one crashes,
          the error boundary will replace both of them.
        </p>
        <BuggyCounter />
        <BuggyCounter />
      </ErrorBoundary>
      <hr />
      <p>
        These two counters are each inside of their own error boundary. So if
        one crashes, the other is not affected.
      </p>
      <ErrorBoundary>
        <BuggyCounter />
      </ErrorBoundary>
      <ErrorBoundary>
        <BuggyCounter />
      </ErrorBoundary>
    </div>
  );
}
```

</Sandpack>

try/catch 仅能用于命令式代码

而，React 组件是声明式的并且具体指出什么需要被渲染
