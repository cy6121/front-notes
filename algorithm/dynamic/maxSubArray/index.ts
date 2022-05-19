
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
