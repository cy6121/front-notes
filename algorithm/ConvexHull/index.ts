import { Vector2 } from "math/Vector2";
import { toLeftTest } from "./help";

/**
 * 凸包算法
 * 极边: 所有点都在边的一侧
 */

/** 极边算法求凸包 */
export function convexHullByEdge(points: Vector2[]): Vector2[] {
    const result = new Set<Vector2>();
    const len = points.length;
    function checkEdge(start: Vector2, end: Vector2, arr: Vector2[]) {
        let lEmpty = true;
        let rEmpty = true;
        for (let k = 0; k < arr.length; k++) {
            if (arr[k] === start || arr[k] === end) {
                continue;
            }
            const isLeft = toLeftTest(start, end, arr[k]);
            if (isLeft) {
                lEmpty = false;
            } else {
                rEmpty = false;
            }
            if (lEmpty === false && rEmpty === false) {
                return false;
            }
        }
        if (lEmpty || rEmpty) {
            return true;
        }
        return false;
    }
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (checkEdge(points[i], points[j], points)) {
                result.add(points[i]);
                result.add(points[j]);
            }
        }
    }
    return Array.from(result);
}