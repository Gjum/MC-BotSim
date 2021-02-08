export class CancelToken {
  private nextHandlerId = 1;

  private cancelHandlers: Record<number, CancelHandler> = {};

  /** The error with which this token was cancelled. */
  error?: Error;

  constructor(parent?: CancelToken) {
    if (parent) {
      parent.onCancel((err) => this.cancel(err));
    }
  }

  /**
   * When this token is cancelled,
   * the `handler` will be called with the cancellation error.
   *
   * If this token has already been cancelled,
   * immediately calls `handler` with the cancellation error.
   *
   * The returned function removes the `handler` from this token.
   */
  onCancel(handler: CancelHandler) {
    if (this.error) {
      handler(this.error);
      return () => {};
    }
    const handlerId = ++this.nextHandlerId;
    this.cancelHandlers[handlerId] = handler;
    return () => {
      this.cancelHandlers[handlerId];
    };
  }

  /**
   * Runs all cancellation handlers concurrently.
   * Waits until all cancellation handlers have finished (to allow cleanup).
   * Any errors thrown by the handlers are logged to `console.error`.
   */
  async cancel(error: Error) {
    if (this.error) return;
    this.error = error;
    const handlerPromises = Object.values(this.cancelHandlers).map((handler) =>
      handler(error)
    );
    for (const handlerPromise of handlerPromises) {
      try {
        await handlerPromise;
      } catch (handlerErr) {
        console.error(`Error in cancellation handler:`, handlerErr);
      }
    }
  }

  check() {
    if (this.error) throw this.error;
    return true;
  }

  makeChild() {
    return new CancelToken(this);
  }
}

export default CancelToken;

export type CancelHandler = (error: Error) => void | Promise<void>;

export async function sleep(ms: number, cancelToken?: CancelToken) {
  let timeout: NodeJS.Timeout | null = null;
  let teardownCancel: () => void = () => {};
  try {
    return await new Promise((resolve, reject) => {
      timeout = setTimeout(resolve, ms);
      if (cancelToken) teardownCancel = cancelToken.onCancel(reject);
    });
  } finally {
    if (timeout) clearTimeout(timeout);
    teardownCancel();
  }
}
