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

export function relative(part, whole) {
  if (Number.isNaN(part) || Number.isNaN(part)) return 0
  if (whole === 0) throw new Error("Cannot divise by zero")
  return Math.round((part / whole) * 100)
}

export function sortListOfObjectsBy(
  objs,
  property,
  options = { order: "desc" },
) {
  if (!isNonEmptyArray(objs)) return [];
  const { order } = options;
  const isPropertyExist = objs.some((entry) => Object.hasOwn(entry, property));
  if (!isPropertyExist) throw new Error(`Unknown property '${property}'`);
  return objs.sort(
    (r1, r2) => (r1[property] - r2[property]) * (order === "asc" ? 1 : -1),
  );
}

