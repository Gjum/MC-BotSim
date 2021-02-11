export function definedOr<T>(value: T | null | undefined, fallback: T) {
  if (value === null || value === undefined) return fallback;
  else return value;
}
