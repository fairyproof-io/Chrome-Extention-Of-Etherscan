export function switchDate(timstamp) {
    if (!timstamp || timstamp <= 0) {
        return ""
    }
    const date = new Date(timstamp);
    const Y = `${date.getFullYear()}.`;
    const M = `${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}.`;
    const D = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
    return Y + M + D;
}