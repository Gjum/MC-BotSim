import { useEffect, useState } from "react";

export function definedOr<T>(value: T | null | undefined, fallback: T) {
  if (value === null || value === undefined) return fallback;
  else return value;
}

export function doEventHandler<H, K extends number | string>(
  registry: Record<K, H>,
  handlerId: K,
  handler: H
) {
  registry[handlerId] = handler;
  return () => {
    delete registry[handlerId];
  };
}

export type EventHandler<V> = (payload: V) => void;

export function emitEventTo<V, K extends number | string>(
  payload: V,
  ...registries: Record<K, EventHandler<V>>[]
) {
  for (const registry of registries) {
    for (const handler of Object.values<EventHandler<V>>(registry)) {
      try {
        handler(payload);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export class EventSystem<T> {
  private nextHandlerId = 1;
  private handlersEach: Record<number, EventHandler<T>> = {};
  private handlersNext: Record<number, EventHandler<T>> = {};
  // use lambdas so parent can bind them to readonly fields
  onEach = (handler: EventHandler<T>) => {
    const handlerId = ++this.nextHandlerId;
    this.handlersEach[handlerId] = handler;
    return () => delete this.handlersEach[handlerId];
  };
  onNext = (handler: EventHandler<T>) => {
    const handlerId = ++this.nextHandlerId;
    this.handlersNext[handlerId] = handler;
    return () => delete this.handlersNext[handlerId];
  };
  emit = (payload: T) => {
    for (const registry of [this.handlersEach, this.handlersNext]) {
      for (const handler of Object.values(registry)) {
        try {
          handler(payload);
        } catch (err) {
          console.error(err);
        }
      }
    }
    this.handlersNext = {};
  };
}

/**
 * Emit only once after the JS event loop iteration ends,
 * even if `emitLater` is called multiple times before the event is emitted.
 */
export class EventSystemLater extends EventSystem<void> {
  queuedEmit = false;
  emitLater = () => {
    if (this.queuedEmit) return;
    this.queuedEmit = true;
    setImmediate(() => {
      this.queuedEmit = false;
      this.emit();
    });
  };
}

/**
 * Execute the callback only once after the JS event loop iteration ends,
 * even if `runLater` is called multiple times before the callback runs.
 */
export class RunLater {
  private queued = false;
  private run: () => void;
  constructor(run: () => void) {
    this.run = run;
  }
  runLater() {
    if (this.queued) return;
    this.queued = true;
    setImmediate(() => {
      this.queued = false;
      this.run();
    });
  }
}

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
