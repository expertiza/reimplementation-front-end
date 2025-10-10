import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Make redux-persist's PersistGate a no-op in tests
vi.mock('redux-persist/integration/react', () => {
  return {
    PersistGate: ({ children }: any) => children,
  }
})

// (Optional) Basic matchMedia stub if any component uses it
if (!('matchMedia' in window)) {
  // @ts-expect-error jsdom shim
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
