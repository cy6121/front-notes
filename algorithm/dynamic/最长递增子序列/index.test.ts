import { lowerBound, getMaxSubsequece, getMaxSubsequeceByBS } from './index';

test('最长递增子序列', () => {
    expect(getMaxSubsequece([1, 3, 17, 2])).toBe(3);
    expect(getMaxSubsequece([1, 3, 17, 2, 4])).toBe(3);
    expect(getMaxSubsequece([1, 3, 17, 2, 4, 6])).toBe(4);
    expect(getMaxSubsequece([0, 1, 0, 3, 2, 3])).toBe(4);

    expect(getMaxSubsequeceByBS([1, 3, 17, 2])).toBe(3);
    expect(getMaxSubsequeceByBS([1, 3, 17, 2, 4])).toBe(3);
    expect(getMaxSubsequeceByBS([1, 3, 17, 2, 4, 6])).toBe(4);
});

test('二分查找最小下界', () => {
    expect(lowerBound([1, 2], 1)).toBe(0);
    expect(lowerBound([1, 2], 2)).toBe(1);
    expect(lowerBound([], 1)).toBe(-1);
    expect(lowerBound([1, 3, 5, 7, 9], 2)).toBe(1);
    expect(lowerBound([1, 3, 5, 7, 9], 6)).toBe(3);
    expect(lowerBound([1, 3, 5, 7, 9], 4)).toBe(2);
    expect(lowerBound([1, 3, 5, 7, 9], 8)).toBe(4);
})