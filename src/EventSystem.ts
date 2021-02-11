export type EventHandler<V> = (payload: V) => void;

export class EventSystem<T> {
  private nextHandlerId = 1;
  private handlersEach: Record<number, EventHandler<T>> = {};
  private handlersNext: Record<number, EventHandler<T>> = {};
  // use lambdas so parent can bind them to readonly fields
  onEach = (handler: EventHandler<T>) => {
    const handlerId = ++this.nextHandlerId;
    this.handlersEach[handlerId] = handler;
    return () => {
      delete this.handlersEach[handlerId];
    };
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
