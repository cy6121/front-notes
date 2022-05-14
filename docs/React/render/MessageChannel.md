

MessageChannel属于宏任务。

```js
function channelFn () {
    const channel = new MessageChannel();

    const port1 = channel.port1;
    const port2 = channel.port2;

    port1.onmessage = function (event) {
        console.log('receive port2 data: ', event.data);
    };

    port2.onmessage = function (event) {
        console.log('receive port1 data: ', event.data);
    };

    port1.postMessage('Hello');
    port1.postMessage('Hello');
    port2.postMessage('Hello');
    port2.postMessage('Hello');
}

function asyncCallByMutationObserver(callback: () => void) {
    const div = document.createElement('div');
    let count = 0;
    const observer = new MutationObserver(() => {
        callback && typeof callback === 'function' && callback.call(null);
    });

    observer.observe(div, { attributes: true });
    div.setAttribute('count', String(++count));
}

setTimeout(() => console.log('setTimeout'), 0);
channelFn();

console.log('macro task');
new Promise((resolve) => {
  console.log(2);
  for (let i = 0; i < 100000; i++) {
    (i === 99999) && resolve();
  }
  console.log(3);
}).then(() => {
  console.log(4);
});
asyncCallByMutationObserver(() => console.log('asyncCallByMutationObserver'));

// macro task 2 3 4 asyncCallByMutationObserver receive port1 data:  Hello receive port2 data:  Hello setTimeout receive port1 data:  Hello receive port2 data:  Hello
```

