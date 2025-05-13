export function intersectingKeys(objs) {
  if (!isNonEmptyArray(objs)) return [];
  const setsOfKeys = objs.map((obj) => new Set(Object.keys(obj)));
  const intersectedSet = setsOfKeys.reduce(
    (a, b) => a.intersection(b),
    setsOfKeys[0],
  );
  return Array.from(intersectedSet);
}

export function maxLengthElement(arr) {
  if (!isNonEmptyArray(arr)) return 0;
  if (arr.some((el) => typeof el !== "string")) {
    throw new Error("Array must contain only strings");
  }
  return arr.reduce((max, str) => Math.max(max, str.length), 0);
}

export function isObject(any) {
  return typeof any === "object" && !Array.isArray(any) && any !== null;
}

export function isNonEmptyArray(any) {
  return Array.isArray(any) && any.length > 0;
}
