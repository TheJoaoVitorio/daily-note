import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App component', () => {
  it('renders the pill with "Ready" status', () => {
    render(<App />)
    expect(screen.getByText('Ready')).toBeDefined()
    expect(screen.getByText('00:00')).toBeDefined()
  })

  it('expands dashboard on hover', () => {
    render(<App />)
    const pill = screen.getByText('Ready').parentElement?.parentElement?.parentElement
    expect(pill).toBeDefined()
    
    // Check elements exist (they are initially hidden by opacity but in the DOM)
    expect(screen.getByText('To Do')).toBeDefined()
    expect(screen.getByText('Activity')).toBeDefined()

    // Trigger hover
    if (pill) {
      fireEvent.mouseEnter(pill)
      expect(pill.className).toContain('w-[400px]') // Expanded width
      
      fireEvent.mouseLeave(pill)
      expect(pill.className).toContain('w-64') // Collapsed width
    }
  })
})
