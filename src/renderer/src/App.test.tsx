import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App component', () => {
  it('renders the pill with "Ready" status', () => {
    render(<App />)
    expect(screen.getByText('Ready')).toBeDefined()
    expect(screen.getByText('00:00')).toBeDefined()
  })
})
