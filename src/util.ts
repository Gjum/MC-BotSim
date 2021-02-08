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

export function emitEventTo<V, K extends number | string>(
  payload: V,
  ...registries: Record<K, (payload: V) => void>[]
) {
  for (const registry of registries) {
    for (const handler of Object.values(registry)) {
      try {
        // TODO sort out the type error here
        (handler as any)(payload);
      } catch (err) {
        console.error(err);
      }
    }
  }
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
