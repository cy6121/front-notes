#### 最大子序列和

给你一个整数数组，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组 是数组中的一个连续部分。

示例 1：

输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
示例 2：

输入：nums = [1]
输出：1
示例 3：

输入：nums = [5,4,-1,7,8]
输出：23

来源：力扣（LeetCode）
链接：https://leetcode.cn/problems/maximum-subarray

```typescript
/**
 * 最大子序列和
 * @param arr
 */
export function maxSubArray(arr: number[]) {
    const len = arr.length;
    if (len === 0) {
        return 0;
    }

    // 动态规划
    // const nums = arr.slice();
    // for (let i = 1; i < len; ++i) {
    //     nums[i] = Math.max(nums[i - 1] + nums[i], nums[i]);
    // }
    // return nums.reduce<number>((pre, cur) => {
    //     return Math.max(pre, cur);
    // }, nums[0]);

    // 贪心法
    let curSum = arr[0], maxSum = arr[0];
    for (let i = 1; i < len; ++i) {
        curSum = Math.max(curSum + arr[i], arr[i]);
        maxSum = Math.max(curSum, maxSum);
    }
    return maxSum;
}
```