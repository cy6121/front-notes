import { Vector2 } from '../../math/Vector2';

export function toLeftTest(start: Vector2, end: Vector2, point: Vector2) {
    const v1 = end.clone().sub(start);
    const v2 = point.clone().sub(start);
    return v1.cross(v2) > 0;
}