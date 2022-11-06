/**
 * 你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，
 * 影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，
 * 如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。
 * 给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。
 * https://leetcode.cn/problems/house-robber/description/
 */

/**
 * @param {number[]} nums
 * @return {number}
 */
export function rob(nums: number[]): number {
    if (nums.length === 0) {
        return 0;
    }
    if (nums.length === 1) {
        return nums[0];
    }
    // 空间复杂度O(n)
    // const dp = [nums[0], Math.max(nums[0], nums[1])];
    // for (let i = 2; i < nums.length; i++) {
    //     dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
    // }
    // return dp[nums.length - 1];

    // 空间复杂度O(1)
    let first = nums[0];
    let second = Math.max(first, nums[1]);
    let temp: number;
    for (let i = 2; i < nums.length; i++) {
        temp = second;
        second = Math.max(second, first + nums[i]);
        first = temp;
    }
    return second;
}

/**
 * 你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都 围成一圈 ，
 * 这意味着第一个房屋和最后一个房屋是紧挨着的。同时，相邻的房屋装有相互连通的防盗系统，
 * 如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警 。给定一个代表每个房屋存放金额的非负整数数组，
 * 计算你 在不触动警报装置的情况下 ，今晚能够偷窃到的最高金额。
 * https://leetcode.cn/problems/house-robber-ii/description/
 */

/**
 * @param {number[]} nums
 * @return {number}
 */
export function rob2(nums: number[]): number {
    const len = nums.length;
    if (len === 0) {
        return 0;
    }
    if (len === 1) {
        return nums[0];
    }
    if (len === 2) {
        return Math.max(nums[0], nums[1]);
    }
    const rob = function(arr: number[], start: number, end: number) {
        let first = arr[start];
        let second = Math.max(first, arr[start + 1]);
        let temp: number;
        for (let i = start + 2; i < end; i++) {
            temp = second;
            second = Math.max(second, first + arr[i]);
            first = temp;
        }
        return second;
    }
    return Math.max(rob(nums, 0, len - 1), rob(nums, 1, len));
};

/**
 * 小偷又发现了一个新的可行窃的地区。这个地区只有一个入口，我们称之为 root 。
 * 除了 root 之外，每栋房子有且只有一个“父“房子与之相连。一番侦察之后，
 * 聪明的小偷意识到“这个地方的所有房屋的排列类似于一棵二叉树”。 如果 两个直接相连的房子在同一天晚上被打劫 ，
 * 房屋将自动报警。给定二叉树的 root 。返回 在不触动警报的情况下 ，小偷能够盗取的最高金额 。
 * https://leetcode.cn/problems/house-robber-iii/
 */

/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

interface TreeNode {
    left?: TreeNode;
    right?: TreeNode;
    val: number;
}

export function rob3(root: TreeNode | null): number {
    // const map = new Map<TreeNode, number[]>();
    // const traverse = (node: TreeNode) => {
    //     if (!node.left && !node.right) {
    //         map.set(node, [0, node.val]);
    //         return;
    //     }
    //     if (node.left) {
    //         traverse(node.left);
    //     }
    //     if (node.right) {
    //         traverse(node.right);
    //     }
    //     const left = (node.left && map.get(node.left)) || [0, 0];
    //     const right = (node.right && map.get(node.right)) || [0, 0];
    //     const leftMax = Math.max(left[0], left[1]);
    //     const rightMax = Math.max(right[0], right[1]);
    //     map.set(node, [leftMax + rightMax, left[0] + right[0] + node.val]);
    // }
    // if (!root) {
    //     return 0;
    // }
    // // 取当前节点值
    // traverse(root);
    // const value = map.get(root);
    // return value ? Math.max(value[0], value[1]) : 0;

    const defaultValue = { select: 0, notSelect: 0 };

    const traverse = (node: TreeNode | null): { select: number, notSelect: number } => {
        if (!node) {
            return { select: 0, notSelect: 0 };
        }
        const l = node.left ? traverse(node.left) : defaultValue;
        const r = node.right ? traverse(node.right) : defaultValue;
        return {
            select: node.val + l.notSelect + r.notSelect,
            notSelect: Math.max(l.select, l.notSelect) + Math.max(r.select, r.notSelect)
        };
    }
    const res = traverse(root);
    return Math.max(res.select, res.notSelect);
};