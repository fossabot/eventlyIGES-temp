import '@testing-library/jest-dom';


if (typeof window !== "undefined" && !window.ResizeObserver) {
  // @ts-ignore
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}