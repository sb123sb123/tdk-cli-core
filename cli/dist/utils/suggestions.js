function levenshteinDistance(left, right) {
    let previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
        const currentRow = [leftIndex];
        for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
            const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
            currentRow[rightIndex] = Math.min(currentRow[rightIndex - 1] + 1, previousRow[rightIndex] + 1, previousRow[rightIndex - 1] + substitutionCost);
        }
        previousRow = currentRow;
    }
    return previousRow[right.length];
}
/**
 * Returns the closest candidate when it is within a conservative typo threshold.
 */
export function suggestClosest(input, candidates) {
    if (input.length === 0 || candidates.length === 0)
        return undefined;
    if (candidates.includes(input))
        return undefined;
    const normalizedInput = input.toLowerCase();
    let closest;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of candidates) {
        if (candidate.length === 0)
            continue;
        const distance = levenshteinDistance(normalizedInput, candidate.toLowerCase());
        if (distance < closestDistance ||
            (distance === closestDistance && (closest === undefined || candidate < closest))) {
            closest = candidate;
            closestDistance = distance;
        }
    }
    const threshold = Math.max(2, Math.floor(input.length / 3));
    return closestDistance <= threshold ? closest : undefined;
}
//# sourceMappingURL=suggestions.js.map