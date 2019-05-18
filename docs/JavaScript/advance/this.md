### 前言

要正确理解this，首先得理解执行上下文，这里推荐汤姆大叔的[执行上下文](http://www.cnblogs.com/TomXu/archive/2012/01/13/2308101.html)，因为`this`是在运行代码时确认具体指向谁，箭头函数除外。

#### 全局作用域中的this

**`node`**: 每个`javaScript`文件都是一个模块，`this`指向空对象（`module.exports`）
```js
this.a = 1;
console.log(this, module.exports);
// { a: 1 } { a: 1 }
```
当然也有些意外，比如下面这种情况: 
```js
this.a = 1;
module.exports = {}
console.log(this, module.exports);
// { a: 1 } {}
```

**浏览器端**: `this`指向`window`。

#### 函数作用域中的this

这里分为两种，一种是全局作用域下直接执行函数，另外一种是被当作某个对象的属性的时候执行。eval的情况这里不作讨论。

##### 全局环境下执行

```js
function foo() {
  console.log(this); // 此时的执行上下文为全局对象
}
foo();
// node global, 浏览器 window
```
当然严格模式下有不同，具体区别如下：

> 严格模式

`this`指向`undefined`(`node` and 浏览器端)

> 非严格模式

**浏览器端**: `this`指向全局变量`window`

**`node`**: `this`指向`global`

##### 被当作属性调用

当函数作为一个对象的属性时，`node`和浏览器端一致，指向调用该属性的对象
```js
var obj = {
  name: 'foo',
  foo: function foo() {
    console.log(this);
  }
}

obj.foo();
// { name: 'foo', foo: [Function: foo] }
```

接下来，做一些升级。

```js
var obj = {
  name: 'foo',
  foo: function foo() {
    console.log(this);
  }
}

var objA = obj.foo;

objA();
// node环境指向global，浏览器端指向window，严格模式下均指向undefined
--------------------------------------------------------------
var obj = {
  name: 'foo',
  foo: function foo() {
    console.log(this);
  }
}

var objA = {
  name: 'objA',
  foo: obj.foo
};

objA.foo();
// { name: 'objA', foo: [Function: foo] }
```

##### call、apply、bind

如果想手动更改函数里的`this`指向，可通过上述3个方法。`call`和`apply`会立即执行，`bind`则返回一个绑定好`this`指向的函数。

```js
var obj = {
  name: 'foo',
  foo: function foo() {
    console.log(this);
  }
}

var objA = {
  name: 'objA',
  foo: obj.foo
};

obj.foo.call(objA); // 将this指向objA
obj.foo.apply(objA);
obj.foo.bind(objA)(); // bind函数会返回一个绑定好this的函数，可供以后调用
/**
{ name: 'objA', foo: [Function: foo] }
{ name: 'objA', foo: [Function: foo] }
{ name: 'objA', foo: [Function: foo] }
*/
```

这里对上述3个方法进行更细的说明，方便更好的理解之间的差异。

```js
var obj = {
  name: 'foo',
  foo: function foo() {
    console.log(this, arguments); // 通过arguments对象访问函数传入的参数列表，类似数组但不是数组，可通过arguments[0]访问到传入的Tom
  }
}

var objA = {
  name: 'objA',
  foo: obj.foo
};

obj.foo.call(objA, 'Tom', 'Jerry');
obj.foo.apply(objA, ['Tom', 'Jerry']);
obj.foo.bind(objA, 'Tom', 'Jerry')(1);
/**
{ name: 'objA', foo: [Function: foo] } [Arguments] { '0': 'Tom', '1': 'Jerry' }
{ name: 'objA', foo: [Function: foo] } [Arguments] { '0': 'Tom', '1': 'Jerry' }
{ name: 'objA', foo: [Function: foo] } [Arguments] { '0': 'Tom', '1': 'Jerry', '2': 1 }

可以看到call和bind是按序列传参，而apply是按数组传参，bind不会更改传参的顺序
*/
```

##### new构造

当函数被当作构造函数调用时，`this`指向构造的那个对象。

注：`new`调用中的`this`不会被`call`、`apply`、`bind`改变。

接下来，简单验证一下，由于`call`和`apply`会立即执行，无法被当作构造函数，只能选择`bind`。

```js
function Foo() {
  console.log(this);
}
var foo = Foo.bind({ name: 'Tom' });
foo();
// { name: 'Tom' }
new foo();
// Foo {}
```

#### 箭头函数中的this

`this`在定义时，就已经知道其具体指向，因为在运行到声明的箭头函数时，会将`this`进行强绑定到外部作用域中的`this`，且无法更改。可以理解为继承了外部作用域中的`this`。由于箭头函数的`this`是确定的，无法更改，因此也无法被当作构造函数调用。

外部作用域为全局作用域：

```js
var foo = () => {
  console.log(this);
}
this.a = 1;
foo();
// 或者下面代码
var obj = {
  name: 'obj',
  foo: () => {
    console.log(this);
  }
}
var foo = obj.foo;
obj.foo();
foo();
foo.call({ name: 'Tom' });
/**
因为obj是在全局作用域下被定义，所以外部作用域为全局对象
node: 指向module.exports
浏览器：指向window
*/
```
外部作用域为函数作用域：

```js
function foo() {
  var a = () => {
    console.log(this); // 继承外部作用域foo函数的this
  };
  a();
}
foo();
foo.call({ name: 'foo' });
new foo();
/**
这里foo函数中的this并不确定，由于调用方式不同，其this指向也不同
*/
```
相信写ES6类的情况很多，本人经常写`React`类组件，刚开始初学者会好奇为什么在类组件里写方法时要用`bind`或者箭头函数来强绑定`this`。因为一般类组件里的方法，都会设计到`this`的处理。比如事件处理函数，当触发相应事件时，调用事件对应的处理函数，此时访问到的`this`为`undefined`(ES6默认类与模块内就是严格模式)，这就导致不能正确处理该组件的状态，甚至出错(处理函数内可能调用`this.setState`方法)。所以在类组件内部声明方法时会需要我们进行强绑定。

接下来我们看看`React`组件渲染流程：`new`构造一个组件实例`instance`，然后调用其`render`方法进行渲染和事件绑定。`new`构造的过程，`this`已经确定指向构造的组件实例，所以你可以在`constructor`进行`bind`或直接使用箭头函数，这样函数内部`this`就绑定到了`instance`。`render`函数里之所以能正常访问`this`，是因为以`instance.render()`进行渲染。

当然这里不特指`React`类组件，只要是ES6类，只能用`new`构造调用，否则会报错，所以ES6类里`this`指向是确定的，可以放心使用箭头函数。

#### 迷惑的代码

还有一个比较迷惑的地方，遇到的机会很少，代码如下：
```js
(function(){
    console.log(this); // 运行结果和全局作用域下执行结果一致
})();
// 由于没有以对象属性的方式调用，则被认为是全局环境下调用
--------------------------------------------------------
(function(){
  console.log(this);
}).call({ name: 'Hello World' });
// { name: 'Hello World' }，this指向可以被改变
--------------------------------------------------------
new (function(name){
  this.name = name;
  console.log(this);
})('Tom');
// { name: 'Tom' }，this指向新创建的对象
```
