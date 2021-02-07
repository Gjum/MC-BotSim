/**
 * If no entry exists at `key`, returns the original record.
 * If the new state is the same object as the old state,
 * returns the original record.
 */
export function reduceRecord<T, A, K extends string | number | symbol>(
  record: Record<K, T>,
  key: K,
  action: A,
  reducer: (state: T, action: A) => T
) {
  const oldState = record[key];
  if (!oldState) return record;
  const newState = reducer(oldState, action);
  if (oldState === newState) return record;
  return { ...record, [key]: newState };
}
