编写一个函数，如果成功直接返回结果, 如果失败后在指定时间间隔后重新获取, 如果指定失败次数后仍失败, 则返回失败原因

```typescript
/**
 * 返回异步任务结果
 * @param fn 异步任务
 * @param interval 时间间隔
 * @param retryCount 重试次数
 */
export function retry<T>(fn: () => Promise<T>, interval: number, retryCount: number) {
    const count = Math.max(0, retryCount);
    const delay = Math.max(0, interval);
    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));
    let result = fn();
    for (let index = 0; index < count; ++index) {
        result = result.catch(() => sleep(delay).then(fn));
    }
    return result;
}

```