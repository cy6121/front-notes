### 事件机制

React事件主要分为两部分: 事件注册与事件分发。下面先从事件注册说起。

#### 事件注册

假设我们的程序如下:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

```js
import React from 'react';
import ReactDOM from 'react-dom';

class ClickCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  handleClick = () => {
    this.setState((state) => {
      return {count: state.count + 1};
    });
  };
  render() {
    return [
      <button key="1" onClick={this.handleClick}>Update counter</button>,
      <span key="2">{this.state.count}</span>,
    ]
  }
}
ReactDOM.hydrate(<ClickCounter />, document.getElementById('root'));
```

事件注册主要发生在初始化Dom属性的时候，调用`setInitialProperties`方法，对一些类型dom进行事件绑定。

```js
switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent(TOP_LOAD, domElement);
      props = rawProps;
      break;

    case 'video':
    case 'audio':
      for (var i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement);
      }

      props = rawProps;
      break;
    ...  
}

setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);
...
```

接着调用`setInitialDOMProperties`来真正初始化Dom属性。根据当前`workInProgress`的`pendingProps`对象，给Dom对象设置属性。其中，有个分支会专门处理事件。

```js
// registrationNameModules是一个map对象，存储着React支持的事件类型
 else if (registrationNameModules.hasOwnProperty(propKey)) {
  if (nextProp != null) {
    ensureListeningTo(rootContainerElement, propKey);
  }
}
```

执行`ensureListeningTo`方法:

```js
// rootContainerElement为React应用的挂载点, registrationName为onClick
function ensureListeningTo(rootContainerElement, registrationName) {
  // 判断rootContainerElement是document还是fragment
  var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  // 获取rootContainerElement所在的document。
  var doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
  listenTo(registrationName, doc);
}
```

开始执行`listenTo`方法，注册事件入口。

```js
// 获取当前已监听的原生事件类型的map
var isListening = getListeningForDocument(mountAt);
// 获取对应的原生事件类型，registrationNameDependencies存储了React事件类型与浏览器原生事件类型映射的一个map
var dependencies = registrationNameDependencies[registrationName];
for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
        switch (dependency) {
          ...// 除了scroll blur focus cancel close方法调trapCapturedEvent方法，invalid submit reset不处理之外，其余都调trapBubbledEvent方法。
          default:
          var isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1;
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt);
          }
          break;
        }
        // 标记该原生事件类型已被注册，下次注册同类型事件时会被忽略
        isListening[dependency] = true;  
    }
}
```

`trapCapturedEvent`与`trapBubbledEvent`的区别是前者注册捕获阶段的事件监听器，后者注册冒泡阶段的事件监听器。`trapCapturedEvent`使用比较少，所以重点看下`trapBubbledEvent`。

```js
//click document
function trapBubbledEvent(topLevelType, element) {
  if (!element) {
    return null;
  }
  // 从字面意能看出，前者是交互类事件，优先级会比普通事件高（click的分发者是dispatchInteractiveEvent）
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;
    
  // 注册事件，在冒泡阶段捕获   
  addEventBubbleListener(element, getRawEventName(topLevelType),
  // Check if interactive and wrap in interactiveUpdates
  dispatch.bind(null, topLevelType));
}
```

#### 总结

可以发现，React把某一类型事件通过事件代理绑定到`document`或`fragment`上（`fragment`的情况比较少）。即`workInProgress`在`complete`过程中，如果之前已经注册过`onClick`事件，后续`workInProgress`中的`onClick`事件将不再注册，统一由`document`中注册的`click`事件代理处理。
