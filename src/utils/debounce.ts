/**
 * 函数防抖（弹簧）
 * @param {function} fn  
 */
function debounce(fn: () => any, wait: number): () => any {
    let timeoutId: any;// 定时器返回值timeoutId是正整数，使用负数作为初始值
    return (...params: []) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...params);
        }, wait);
    }
}
export default debounce;