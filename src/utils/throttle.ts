/**
 * 函数节流（水龙头）
 * @param {function} fn
 */
function throttle(fn: () => any, wait: number): () => any {
    let timeoutId: any;

    return (...params: []) => {
        if (timeoutId === -1) { return; }
        timeoutId = setTimeout(() => {
            fn(...params);
            timeoutId = -1;
        }, wait)
    }
}
export default throttle;