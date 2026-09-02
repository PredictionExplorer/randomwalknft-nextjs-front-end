import { vi } from "vitest";

/**
 * jsdom has no 2D canvas. This stand-in records the calls the walk painter and the
 * constellation map make so tests can assert on painting without a real rasteriser.
 */
export function installFakeCanvas() {
  const contexts: FakeContext[] = [];

  class FakeContext {
    calls: string[] = [];
    fillStyle = "";
    strokeStyle = "";
    lineWidth = 1;
    frame: { data: Uint8ClampedArray; width: number; height: number } | null = null;

    createImageData(width: number, height: number) {
      this.frame = { data: new Uint8ClampedArray(width * height * 4), width, height };
      return this.frame;
    }
    putImageData() {
      this.calls.push("putImageData");
    }
    getImageData() {
      return this.frame ?? { data: new Uint8ClampedArray(0), width: 0, height: 0 };
    }
    fillRect() {
      this.calls.push("fillRect");
    }
    clearRect() {
      this.calls.push("clearRect");
    }
    setTransform() {
      this.calls.push("setTransform");
    }
    beginPath() {
      this.calls.push("beginPath");
    }
    arc() {
      this.calls.push("arc");
    }
    fill() {
      this.calls.push("fill");
    }
    stroke() {
      this.calls.push("stroke");
    }
    drawImage() {
      this.calls.push("drawImage");
    }
  }

  const getContext = vi.fn(function getContext(this: HTMLCanvasElement) {
    const context = new FakeContext();
    contexts.push(context);
    return context as unknown as CanvasRenderingContext2D;
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { configurable: true, value: getContext });
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    configurable: true,
    value: () => "data:image/png;base64,AAAA"
  });

  return { contexts, getContext };
}
