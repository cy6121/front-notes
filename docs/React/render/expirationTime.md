<center>expirationTime</center>

```js
// unstable_now的取值逻辑

// 存在window变量且支持MessageChannel和performance
exports.unstable_now = function () {
  return performance.now();
};
// 否则
var _initialTime = _Date.now();
exports.unstable_now = function () {
  return _Date.now() - _initialTime;
};
```





| 常量    | 值                    |      |
| ------- | --------------------- | ---- |
| NoWork  | 0                     |      |
| Never   | 1                     |      |
| Idle    | 2                     |      |
| Sync    | MAX_SIGNED_31_BIT_INT |      |
| Batched | Sync - 1              |      |

```js
var UNIT_SIZE = 10;
var MAGIC_NUMBER_OFFSET = Batched - 1; // 1 unit of expiration time represents 10ms.

// 计算当前时间（在10ms内，计算出的过期时间都是一样的）
function msToExpirationTime(ms) {
  // Always subtract from the offset so that we don't clash with the magic number for NoWork.
  return MAGIC_NUMBER_OFFSET - (ms / UNIT_SIZE | 0);
}
```

