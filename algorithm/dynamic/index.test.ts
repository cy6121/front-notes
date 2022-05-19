import { maxSubArray } from './index';

test('maxSubArray test:', () => {
    const arr1 = [1, 2, 3, -4, 12];
    const arr2 = [-2,1,-3,4,-1,2,1,-5,4];
    const arr3 = [5,4,-1,7,8];
    expect(maxSubArray(arr1)).toBe(14);
    expect(maxSubArray(arr2)).toBe(6);
    expect(maxSubArray(arr3)).toBe(23);
    expect(maxSubArray([1])).toBe(1);
    expect(maxSubArray([])).toBe(0);
});
