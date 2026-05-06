export const bound = (n, min, max) => Math.max(min, Math.min(max, n));

export const closest = (n, arr) => {
  if(!arr?.length) return n;
  return arr.reduce((best, cur) => {
    const curDist = Math.abs(cur - n);
    const bestDist = Math.abs(best - n);
    return curDist < bestDist || (curDist === bestDist && cur > best) ? cur : best;
  });
};
