import { useEffect, useState } from "react";

export type Result<T> = { value?: T; error?: Error };

export function usePromise<T>(
  makePromise: () => Promise<T>,
  deps?: React.DependencyList
): Result<T> {
  const [value, setValue] = useState<Result<T>>({});
  useEffect(() => {
    makePromise().then((value) => setValue({ value }));
  }, deps || []);
  return value;
}

/** Trigger component render when event is emitted at `onEachChange`. */
export function useOnChange<T extends ChangeEmitter>(emitter: T) {
  const [_, setStateId] = useState(1);
  useEffect(
    () =>
      emitter.onEachChange(() => {
        setStateId((s) => s + 1);
      }),
    [emitter]
  );
}
export type ChangeEmitter = {
  onEachChange: (handler: () => void) => () => void;
};
