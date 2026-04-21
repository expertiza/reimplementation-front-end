import '@testing-library/jest-dom';
import { expect, vi, afterAll, beforeAll } from 'vitest';

// Create jest compatibility layer for spies/mocks that are called in hooks
const jest = {
  spyOn: vi.spyOn,
  fn: vi.fn,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

// Make jest available globally for runtime spies
globalThis.jest = jest as any;

// Add test skip functions (xit, xdescribe, etc.)
globalThis.xit = it.skip;
globalThis.xdescribe = describe.skip;
globalThis.xtest = test.skip;

// Mock window.alert and window.confirm
globalThis.alert = vi.fn();
globalThis.confirm = vi.fn(() => true);

// Mock window.matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});
