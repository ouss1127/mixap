export class Eventifyer {
  private handlers;

  constructor() {
    this.handlers = null;
  }

  public on(event, fn) {
    if (!this.handlers) {
      this.handlers = {};
    }

    let handlers = this.handlers[event];
    if (!handlers) {
      handlers = this.handlers[event] = [];
    }
    handlers.push(fn);

    // Return an event descriptor
    return {
      name: event,
      callback: fn,
      off: (e, fn) => this.off(e, fn),
    };
  }

  public once(event, handler) {
    const fn = (...args) => {
      /*  eslint-disable no-invalid-this */
      handler.apply(this, args);
      /*  eslint-enable no-invalid-this */
      setTimeout(() => {
        this.off(event, fn);
      }, 0);
    };
    return this.on(event, fn);
  }

  public off(event, fn?) {
    if (!this.handlers) {
      return;
    }

    const handlers = this.handlers[event];
    let i;
    if (handlers) {
      if (fn) {
        for (i = handlers.length - 1; i >= 0; i--) {
          if (handlers[i] == fn) {
            handlers.splice(i, 1);
          }
        }
      } else {
        handlers.length = 0;
      }
    }
  }

  public offAll() {
    this.handlers = null;
  }

  public emit(event, ...args) {
    if (!this.handlers || !this.handlers[event]) {
      return;
    }
    this.handlers[event].forEach((fn) => fn(...args));
  }
}
