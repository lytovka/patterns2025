export function intersectingKeys(objs) {
  const setsOfKeys = objs.map((obj) => new Set(Object.keys(obj)));
  const intersectedSet = setsOfKeys.reduce(
    (a, b) => a.intersection(b),
    setsOfKeys[0],
  );
  return Array.from(intersectedSet);
}

export function maxLengthElement(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((max, str) => Math.max(max, str.length), 0);
}

export function isObject(any) {
  return typeof any === "object" && !Array.isArray(any) && any !== null;
}

export function isNonEmptyArray(any) {
  return Array.isArray(any) && any.length > 0;
}
