import { process } from '../ResizeObserverController';
import { prettifyConsoleOutput } from './prettify';

// Keep original reference of raf to use later
const requestAnimationFrame = window.requestAnimationFrame;

const observerConfig = { attributes: true, characterData: true, childList: true, subtree: true };

const events = [
  // Global Resize
  'resize',
  // Global Load
  'load',
  // Transitions & Animations
  'transitionend',
  'animationend',
  'animationstart',
  'animationiteration',
  // Interactions
  'keyup',
  'keydown',
  'mouseup',
  'mousedown',
  'mouseover',
  'mouseout',
  'blur',
  'focus'
];

const rafSlots = new Map();
const resizeObserverSlots = new Map();

let handle: number | undefined;
const dispatchCallbacksOnNextFrame = (): void => {
  if (typeof handle === 'number') {
    return;
  }
  function dispatchFrameEvents(t: number): void {
    handle = undefined;
    const callbacks: FrameRequestCallback[] = [];
    rafSlots.forEach(callback => callbacks.push(callback));
    resizeObserverSlots.forEach(callback => callbacks.push(callback));
    rafSlots.clear(); resizeObserverSlots.clear();
    for (let callback of callbacks) {
      callback(t);
    }
  };
  handle = requestAnimationFrame(dispatchFrameEvents)
}

class Scheduler {

  private observer: MutationObserver | undefined;
  private listener: () => void;
  public stopped: boolean = true

  public constructor () {
    this.listener = (): void => this.schedule();
  }

  public run (frames: number): void {
    resizeObserverSlots.set(this, () => {
      // Have any changes happened?
      if (process()) {
        this.run(60);
      }
      // Should we continue to check?
      else if (frames) {
        this.run(frames - 1);
      }
    });
    dispatchCallbacksOnNextFrame();
  }

  public schedule (): void {
    this.run(1);
  }

  private observe (): void {
    const cb = (): void => this.observer && this.observer.observe(document.body, observerConfig);
    /* istanbul ignore next */
    document.body ? cb() : window.addEventListener('DOMContentLoaded', cb);
  }

  public start (): void {
    if (this.stopped) {
      this.stopped = false;
      if ('MutationObserver' in window) {
        this.observer = new MutationObserver(this.listener);
        this.observe();
      }
      events.forEach(name => window.addEventListener(name, this.listener, true));
    }
  }

  public stop (): void {
    if (!this.stopped) {
      this.observer && this.observer.disconnect();
      events.forEach(name => window.removeEventListener(name, this.listener, true));
      this.stopped = true;
    }
  }
}

const scheduler = new Scheduler();
let rafIdBase = 0;

// Override requestAnimationFrame to make sure
// calculations are performed after any changes may occur.
// * Is there another way to schedule without modifying the whole function?
window.requestAnimationFrame = function (callback) {
  if (typeof callback !== 'function') {
    throw new Error('requestAnimationFrame expects 1 callback argument of type function.');
  }
  const handle = rafIdBase += 1;
  rafSlots.set(handle, callback);
  dispatchCallbacksOnNextFrame();
  return handle;
}
// Override cancelAnimationFrame
// as we need to handle custom removal
window.cancelAnimationFrame = function (handle) {
  rafSlots.delete(handle);
}
prettifyConsoleOutput(window.requestAnimationFrame);
prettifyConsoleOutput(window.cancelAnimationFrame);

export { scheduler };
