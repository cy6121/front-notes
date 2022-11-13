import { convexHullByEdge } from '.';
import { Vector2 } from '../../math/Vector2';
import { toLeftTest } from './help';

test('toLeftTest', () => {
    const start = new Vector2();
    const end = new Vector2(1, 0);

    expect(toLeftTest(start, end, new Vector2(1, 1))).toBe(true);
    expect(toLeftTest(start, end, new Vector2(-1, 1))).toBe(true);
    expect(toLeftTest(start, end, new Vector2(-1, -1))).toBe(false);
    expect(toLeftTest(start, end, new Vector2(1, -1))).toBe(false);
});

test('convexHullByEdge', () => {
    const points = [
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(1, 1),
        new Vector2(0, 1),
        new Vector2(0.5, 0.9),
        new Vector2(0.5, 0.5)
    ];
    const res = convexHullByEdge(points);
    const isSame = (arr1: Vector2[], arr2: Vector2[]) => {
        return arr1.every(v1 => arr2.some(v2 => v1.equal(v2)));
    }
    expect(isSame(res, [
        new Vector2(0, 0),
        new Vector2(1, 0),
        new Vector2(1, 1),
        new Vector2(0, 1),
    ])).toBe(true);
});
