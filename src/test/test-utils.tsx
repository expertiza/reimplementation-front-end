import React, { PropsWithChildren, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

// Minimal slices your components expect. Add more if your UI reads them.
const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: { isAuthenticated: false, user: null } as {
    isAuthenticated: boolean
    user: any
  },
  reducers: {}
})

export type Preloaded = Partial<{
  authentication: { isAuthenticated: boolean; user: any }
}>

export function makeTestStore(preloadedState?: Preloaded) {
  return configureStore({
    reducer: {
      authentication: authenticationSlice.reducer,
    },
    preloadedState: preloadedState as any
  })
}

function Providers({
  children,
  preloadedState
}: PropsWithChildren<{ preloadedState?: Preloaded }>) {
  const store = makeTestStore(preloadedState)
  return <Provider store={store}>{children}</Provider>
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Preloaded }
) {
  const { preloadedState, ...rest } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers preloadedState={preloadedState}>{children}</Providers>
    ),
    ...rest
  })
}
