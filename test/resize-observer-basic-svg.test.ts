import { ResizeObserver } from '../src/ResizeObserver';
import { DOMRectReadOnly } from '../src/DOMRectReadOnly';

describe('SVGGraphicsElement', () => {

  let el: SVGGraphicsElement;
  let ro: ResizeObserver;

  beforeEach(() => {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(el);
    el.style.width = '100px';
    el.style.height = '100px';
  })

  afterEach(() => {
    while (document.body.firstElementChild) {
      document.body.removeChild(document.body.firstElementChild);
    }
  })

  test('Should fire observer when element is observed for the first time.', (done) => {
    ro = new ResizeObserver((entries, observer) => {
      expect(entries).toHaveLength(1);
      expect(entries[0].target).toBe(el);
      expect(observer).toBe(ro);
      expect(entries[0].contentRect).toMatchObject({
        top: 0,
        left: 0,
        width: 100,
        height: 100
      });
      done();
    });
    el.getBBox = function (): DOMRect {
      return new DOMRectReadOnly(0, 0, 100, 100) as DOMRect;
    }
    ro.observe(el);
  })

})