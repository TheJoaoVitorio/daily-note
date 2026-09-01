import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

describe('App component', () => {
  it('renders the pill with "Ready to Focus" status', () => {
    render(<App />)
    expect(screen.getByText('Ready to Focus')).toBeDefined()
    expect(screen.getByText('00:00')).toBeDefined()
  })

  it('expands dashboard on hover', () => {
    render(<App />)
    const pill = screen.getByText('Ready to Focus').parentElement?.parentElement?.parentElement
    expect(pill).toBeDefined()
    
    // Check elements exist (they are initially hidden by opacity but in the DOM)
    expect(screen.getByText(/Journey Streak/)).toBeDefined()
    
    // Trigger hover
    if (pill) {
      fireEvent.mouseEnter(pill)
      expect(pill.className).toContain('w-[760px]') // Expanded width
      
      fireEvent.mouseLeave(pill)
      expect(pill.className).toContain('w-[320px]') // Collapsed width
    }
  })
})
