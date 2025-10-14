import React, { PropsWithChildren, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

// Create a minimal Redux slice for authentication.
// This slice is used to mock the authentication state in tests.
const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: { isAuthenticated: false, user: null } as {
    isAuthenticated: boolean
    user: any
  },
  reducers: {} // No reducers are needed since this is only for testing purposes.
})

// Define the shape of the preloaded state that can be passed to the test store.
// This allows you to customize the initial state for specific test cases.
export type Preloaded = Partial<{
  authentication: { isAuthenticated: boolean; user: any }
}>

// Function to create a Redux store for testing.
// It accepts an optional `preloadedState` to initialize the store with specific values.
export function makeTestStore(preloadedState?: Preloaded) {
  return configureStore({
    reducer: {
      authentication: authenticationSlice.reducer, // Add the authentication slice to the store.
    },
    preloadedState: preloadedState as any // Use the provided preloaded state, if any.
  })
}

// A wrapper component that provides the Redux store to child components.
// This is used to wrap the components being tested with the Redux `Provider`.
function Providers({
  children,
  preloadedState
}: PropsWithChildren<{ preloadedState?: Preloaded }>) {
  const store = makeTestStore(preloadedState) // Create the test store with the given preloaded state.
  return <Provider store={store}>{children}</Provider> // Provide the store to the children.
}

// Utility function to render a component with Redux providers for testing.
// This function wraps the component with the `Provider` and allows passing a preloaded state.
export function renderWithProviders(
  ui: ReactElement, // The React component to render.
  options?: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Preloaded } // Additional options for rendering.
) {
  const { preloadedState, ...rest } = options ?? {} // Extract the preloaded state and other options.
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers preloadedState={preloadedState}>{children}</Providers> // Wrap the component with the Redux provider.
    ),
    ...rest // Pass other options to the render function.
  })
}