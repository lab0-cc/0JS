// This module provides math primitives


// Compute the median of an array of values
export function med(l) {
    if (l.length === 0)
        return NaN;
    const m = (l.length - 1) / 2;
    const sorted = l.toSorted();
    return (sorted[Math.floor(m)] + sorted[Math.ceil(m)]) / 2;
}

// Compute the median absolute deviation of an array; a precomputed median can be passed
export function mad(l, median = null) {
    if (l.length === 0)
        return 0;
    if (median === null)
        median = med(l);
    return med(l.map(v => Math.abs(v - median)));
}
