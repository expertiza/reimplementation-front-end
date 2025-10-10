import React from 'react'
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from './test/test-utils'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<App />)
    expect(container.firstChild).toBeTruthy()
  })

})
