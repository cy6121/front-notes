import { rob, rob2, rob3 } from './index';

test('rob', () => {
    expect(rob([1,2,3,1])).toBe(4);
    expect(rob([2,7,9,3,1])).toBe(12);
});

test('rob2', () => {
    expect(rob2([2,3,2])).toBe(3);
    expect(rob2([1,2,3,1])).toBe(4);
    expect(rob2([1,2,3])).toBe(3);
});

test('rob3', () => {
    const root = {
        val: 3,
        left: {
            val: 2,
            right: {
                val: 3
            }
        },
        right: {
            val: 3,
            right: {
                val: 1
            }
        }
    }
    expect(rob3(root)).toBe(7);
})