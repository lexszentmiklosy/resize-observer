import { DOMRectReadOnly } from './DOMRectReadOnly';
import { ResizeObserverSize } from './ResizeObserverSize';
import { calculateBoxSizes } from './algorithms/calculateBoxSize';

/**
 * https://drafts.csswg.org/resize-observer-1/#resize-observer-entry-interface
 */
class ResizeObserverEntry {
  public target: Element;
  public contentRect: DOMRectReadOnly;
  public borderBoxSize: ResizeObserverSize;
  public contentSize: ResizeObserverSize;
  public scrollSize: ResizeObserverSize;
  public devicePixelBorderBoxSize: ResizeObserverSize;
  public constructor (target: Element) {
    const boxes = calculateBoxSizes(target);
    this.target = target;
    this.contentRect = boxes.contentRect;
    this.borderBoxSize = boxes.borderBoxSize;
    this.contentSize = boxes.contentBoxSize;
    this.scrollSize = boxes.scrollBoxSize;
    this.devicePixelBorderBoxSize = boxes.devicePixelBorderBoxSize;
  }
}

export { ResizeObserverEntry };
