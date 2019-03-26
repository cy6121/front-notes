#### 事件分发

之前讲述了事件如何绑定在`document`上，那么具体事件触发的时候是如何分发到具体的监听者呢？我们接着上次注册的事件代理看。当我点击`update counter`按钮时，触发注册的`click`事件代理。

```js
function dispatchInteractiveEvent(topLevelType, nativeEvent) {
  interactiveUpdates(dispatchEvent, topLevelType, nativeEvent);
}
function interactiveUpdates(fn, a, b) {
  return _interactiveUpdatesImpl(fn, a, b);
}
var _interactiveUpdatesImpl = function (fn, a, b) {
  return fn(a, b);
};
```

`topLevelType`为`click`，`nativeEvent`为真实dom事件对象。看似很多，其实就做了一件事: 执行`dispatchEvent(topLevelType, nativeEvent)`。其实不然，`_interactiveUpdatesImpl`在后面被重新赋值为`interactiveUpdates$1`，完成了一次自我蜕变。

```js
function setBatchingImplementation(batchedUpdatesImpl, interactiveUpdatesImpl, flushInteractiveUpdatesImpl) {
  _batchedUpdatesImpl = batchedUpdatesImpl;
  _interactiveUpdatesImpl = interactiveUpdatesImpl;
  _flushInteractiveUpdatesImpl = flushInteractiveUpdatesImpl;
}

function interactiveUpdates$1(fn, a, b) {
  if (!isBatchingUpdates && !isRendering && lowestPriorityPendingInteractiveExpirationTime !== NoWork) {
    performWork(lowestPriorityPendingInteractiveExpirationTime, false);
    lowestPriorityPendingInteractiveExpirationTime = NoWork;
  }
  var previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    return scheduler.unstable_runWithPriority(scheduler.unstable_UserBlockingPriority, function () {
      return fn(a, b);
    });
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}

setBatchingImplementation(batchedUpdates$1, interactiveUpdates$1, flushInteractiveUpdates$1);
```

如果有任何等待的交互更新，条件满足的情况下会先同步更新，然后设置`isBatchingUpdates`，进行`scheduler`调度。最后同步更新。`scheduler`的各类[优先级](https://github.com/facebook/react/blob/master/packages/scheduler/src/Scheduler.js)如下:

```js
unstable_ImmediatePriority: 1
unstable_UserBlockingPriority: 2
unstable_NormalPriority: 3
unstable_LowPriority: 4
unstable_IdlePriority: 5
```

进入`scheduler`调度，根据优先级计算时间，开始执行传入的回调函数。然后调用`dispatchEvent`，最后更新`immediate work`。`flushImmediateWork`里的调用关系很复杂，最终会调用`requestAnimationFrame`进行更新，这里不进行过多讨论。

```js
function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;
    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  var previousEventStartTime = currentEventStartTime;
  currentPriorityLevel = priorityLevel;
  currentEventStartTime = exports.unstable_now();

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
    currentEventStartTime = previousEventStartTime;
    flushImmediateWork();
  }
}
```

下面看看`dispatchEvent`的具体执行过程。

```js
function dispatchEvent(topLevelType, nativeEvent) {
  if (!_enabled) {
    return;
  }
  // 获取事件触发的原始节点
  var nativeEventTarget = getEventTarget(nativeEvent);
  // 获取原始节点最近的fiber对象（通过缓存在dom上的internalInstanceKey属性来寻找），如果没找到会往父节点继续寻找。
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);

  if (targetInst !== null && typeof targetInst.tag === 'number' && !isFiberMounted(targetInst)) {
    targetInst = null;
  }
  // 创建对象，包含事件名称，原始事件，目标fiber对象和ancestor(空数组)；如果缓存池有则直接取出并根据参数初始化属性。
  var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);

  try {
    // 批处理事件
    batchedUpdates(handleTopLevel, bookKeeping);
  } finally {
    // 释放bookKeeping对象内存，并放入对象池缓存
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}
```

接着看`batchedUpdates`，其实就是设置`isBatching`变量然后调用`handleTopLevel(bookkeeping)`。

```js
function batchedUpdates(fn, bookkeeping) {
  if (isBatching) {
    return fn(bookkeeping);
  }
  isBatching = true;
  try {
    // _batchedUpdatesImpl其实指向batchedUpdates$1函数，具体细节这里不再赘述
    return _batchedUpdatesImpl(fn, bookkeeping);
  } finally {
    isBatching = false;
    var controlledComponentsHavePendingUpdates = needsStateRestore();
    if (controlledComponentsHavePendingUpdates) {
      _flushInteractiveUpdatesImpl();
      restoreStateIfNeeded();
    }
  }
}
```

所以将原始节点对应最近的`fiber`缓存在`bookKeeping.ancestors`中。

```js
function handleTopLevel(bookKeeping) {
  var targetInst = bookKeeping.targetInst;
  var ancestor = targetInst;
  do {
    if (!ancestor) {
      bookKeeping.ancestors.push(ancestor);
      break;
    }
    var root = findRootContainerNode(ancestor);
    if (!root) {
      break;
    }
    bookKeeping.ancestors.push(ancestor);
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    runExtractedEventsInBatch(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}
```

`runExtractedEventsInBatch`中调用了两个方法: `extractEvents`和`runEventsInBatch`。前者构造合成事件，后者批处理合成事件。

```js
function runExtractedEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var events = extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
  runEventsInBatch(events);
}
```

#### 事件合成

```js
 function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var events = null;

  for (var i = 0; i < plugins.length; i++) {
    var possiblePlugin = plugins[i];
    if (possiblePlugin) {
      var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);

      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
      }
    }
  }

  return events;
}
```

[plugins](https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOMClientInjection.js)是所有合成事件集合的数组，`EventPluginHub`初始化的时候完成注入。遍历所有`plugins`，调用其`extractEvents`方法，返回构造的合成事件。`accumulateInto`函数则把合成事件放入`events`。本例`click`事件合适的`plugin`是`SimpleEventPlugin`，其他plugin得到的`extractedEvents`都不满足`if (extractedEvents)`条件。

```js
EventPluginHubInjection.injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin,
});
```

接下来看看构造合成事件的具体过程，这里针对`SimpleEventPlugin`，其他`plugin`就不一一分析了，来看下其`extractEvents`:

```js
extractEvents: function(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor = void 0;
    switch (topLevelType) {
      ...
      case TOP_CLICK:
      ...
        EventConstructor = SyntheticMouseEvent;
        break;
      ...    
    }
    var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
    accumulateTwoPhaseDispatches(event);
    return event;
  }
```

`topLevelEventsToDispatchConfig`是一个map对象，存储着各类事件对应的配置信息。这里获取到`click`的配置信息，然后根据`topLevelType`选择对应的合成构造函数，这里为`SyntheticMouseEvent`。接着从`SyntheticMouseEvent`合成事件对象池中获取合成事件。调用`EventConstructor.getPooled`，最终调用的是`getPooledEvent`。

> **注意**: SyntheticEvent.extend方法中明确写有addEventPoolingTo(Class)；所以，SyntheticMouseEvent有eventPool、getPooled和release属性。后面会详细介绍SyntheticEvent.extend

```js
function addEventPoolingTo(EventConstructor) {
  EventConstructor.eventPool = [];
  EventConstructor.getPooled = getPooledEvent;
  EventConstructor.release = releasePooledEvent;
}
```

首次触发事件，对象池为空，所以这里需要新创建。如果不为空，则取出一个并初始化。

```js
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  var EventConstructor = this;
  if (EventConstructor.eventPool.length) {
    var instance = EventConstructor.eventPool.pop();
    EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
    return instance;
  }
  return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
}
```

合成事件的属性是由`React`主动生成的，一些属性和原生事件的属性名完全一致，使其完全符合W3C标准，因此在事件层面上具有跨浏览器兼容性。如果要访问原生对象，通过`nativeEvent`属性即可获取。这里`SyntheticMouseEvent`由`SyntheticUIEvent`扩展而来，而`SyntheticUIEvent`由`SyntheticEvent`扩展而来。

```js
var SyntheticMouseEvent = SyntheticUIEvent.extend({
  ...
});

var SyntheticUIEvent = SyntheticEvent.extend({
  ...
});

SyntheticEvent.extend = function (Interface) {
  var Super = this;
  // 原型继承
  var E = function () {};
  E.prototype = Super.prototype;
  var prototype = new E();
  // 构造继承
  function Class() {
    return Super.apply(this, arguments);
  }
  _assign(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = _assign({}, Super.Interface, Interface);
  Class.extend = Super.extend;
  addEventPoolingTo(Class);

  return Class;
};

```

当被new创建时，会调用父类`SyntheticEvent`进行构造。主要是将原生事件上的属性挂载到合成事件上，还配置了一些额外属性。

```js
function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent;
  ...
}
```

合成事件构造完成后，调用`accumulateTwoPhaseDispatches`。

```js
function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

// 循环处理所有的合成事件
function forEachAccumulated(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
}

// 检测事件是否具有捕获阶段和冒泡阶段
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
  }
}

function traverseTwoPhase(inst, fn, arg) {
  var path = [];
  // 循环遍历当前元素及父元素，缓存至path
  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }
  var i = void 0;
  // 捕获阶段
  for (i = path.length; i-- > 0;) {
    fn(path[i], 'captured', arg);
  }
  // 冒泡阶段
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}

function accumulateDirectionalDispatches(inst, phase, event) {
  // 获取当前阶段对应的事件处理函数
  var listener = listenerAtPhase(inst, event, phase);
  // 将相关listener和目标fiber挂载到event对应的属性上
  if (listener) {
    event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}
```

#### 事件执行（批处理合成事件）

首先将`events`合并到事件队列，之前没有处理完毕的队列也一同合并。如果新的事件队列为空，则退出。反之开始循环处理事件队列中每一个`event`。`forEachAccumulated`前面有提到过，这里不再赘述。

```js
function runEventsInBatch(events) {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }
  var processingEventQueue = eventQueue;
  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
  rethrowCaughtError();
}
```

接下来看看事件处理，`executeDispatchesAndRelease`方法将事件执行和事件清理分开。

```js
var executeDispatchesAndReleaseTopLevel = function (e) {
  return executeDispatchesAndRelease(e);
};

var executeDispatchesAndRelease = function (event) {
  if (event) {
    // 执行事件
    executeDispatchesInOrder(event);

    if (!event.isPersistent()) {
      // 事件清理，将合成事件放入对象池
      event.constructor.release(event);
    }
  }
};
```

提取事件的处理函数和对应的fiber，调用`executeDispatch`。

```js
function executeDispatchesInOrder(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}
```

获取真实dom挂载到`event`对象上，然后开始执行事件。

```js
function executeDispatch(event, listener, inst) {
  var type = event.type || 'unknown-event';
  // 获取真实dom
  event.currentTarget = getNodeFromInstance(inst);
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}
```

`invokeGuardedCallbackAndCatchFirstError`下面调用的方法很多，最终会来到`invokeGuardedCallbackImpl`，关键就在`func.apply(context, funcArgs)`;这里的`func`就是`listener`（本例中是`handleClick`），而`funcArgs`就是合成事件对象。至此，事件执行完毕。

```js
var invokeGuardedCallbackImpl = function (name, func, context, a, b, c, d, e, f) {
  var funcArgs = Array.prototype.slice.call(arguments, 3);
  try {
    func.apply(context, funcArgs);
  } catch (error) {
    this.onError(error);
  }
};
```

#### 事件清理

事件执行完之后，剩下就是一些清理操作。`event.constructor.release(event)`相当于`releasePooledEvent(event)`。由于`click`对应的是`SyntheticMouseEvent`，所以会放入`SyntheticMouseEvent.eventPool`中。`EVENT_POOL_SIZE`固定为10。

```js
function releasePooledEvent(event) {
  var EventConstructor = this;
  event.destructor();
  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}
```

这里做了两件事，第一手动释放`event`属性上的内存（将属性置为`null`），第二将`event`放入对象池。至此，清理工作完毕。

```js
destructor: function () {
    ...
    this.dispatchConfig = null;
    this._targetInst = null;
    this.nativeEvent = null;
    this.isDefaultPrevented = functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
    this._dispatchListeners = null;
    this._dispatchInstances = null;
    ...
}    
```

`event`清理完后，还会清理`bookKeeping`，同样也会放入对象池进行缓存。同样`CALLBACK_BOOKKEEPING_POOL_SIZE`也固定为10。

```js
// callbackBookkeepingPool是react-dom中的全局变量
function releaseTopLevelCallbackBookKeeping(instance) {
  instance.topLevelType = null;
  instance.nativeEvent = null;
  instance.targetInst = null;
  instance.ancestors.length = 0;

  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance);
  }
}
```

#### 总结

最后执行`performSyncWork`。如果执行的事件内调用了`this.setState`，会进行`reconciliation`和`commit`。由于事件流的执行是批处理过程，同步调用`this.setState`不会立马更新，需等待所有事件执行完成，即`scheduler`调度完后才开始`performSyncWork`，最终才能拿到新的`state`。如果是`setTimeout`或者是在dom上另外`addEventListener`的回调函数中调用`this.setState`则会立马更新。因为执行回调函数的时候不经过`React`事件流。
