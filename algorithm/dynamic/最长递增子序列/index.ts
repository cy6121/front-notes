/**
 * https://leetcode.cn/problems/longest-increasing-subsequence/description/
 */

/**
 * 返回数组中第一个大于或等于num的下标, 没有则返回-1
 * @param arr
 * @param num
 * @returns
 */
export function lowerBound(arr: number[], num: number) {
    const len = arr.length;
    if (len === 0) {
        return -1;
    }
    if (len === 1) {
        return arr[0] >= num ? 0 : -1;
    }
    let left = 0;
    let right = len - 1;
    let mid;
    while (left <= right) {
        mid = Math.floor((left + right) / 2);
        if (arr[mid] > num) {
            right = mid - 1;
        } else if (arr[mid] < num) {
            left = mid + 1;
        } else {
            return mid;
        }
    }
    return left;
}

export function getMaxSubsequece(nums: number[]) {
    const dp = new Array<number>(nums.length).fill(1);

    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    return dp.reduce((pre, cur) => {
        return Math.max(pre, cur);
    }, 0);
}

export function getMaxSubsequeceByBS(nums: number[]) {
    const queue: number[] = [];
    for (let i = 0; i < nums.length; i++) {
        if (queue.length === 0 || nums[i] > queue[queue.length - 1]) {
            queue.push(nums[i]);
        } else {
            const index = lowerBound(queue, nums[i]);
            if (index !== -1) {
                queue[index] = nums[i];
            }
        }
    }
    return queue.length;
}