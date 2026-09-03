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
    const pill = screen.getByText('Ready to Focus').closest('.group > div:nth-child(2)')
    expect(pill).toBeDefined()
    
    if (pill) {
      fireEvent.mouseEnter(pill)
      expect(pill.className).toContain('w-[540px]') // Hovered width

      // In hovered state, 'Journey Streak' should be visible
      expect(screen.getByText(/Journey Streak/)).toBeDefined()
      
      fireEvent.mouseLeave(pill)
      expect(pill.className).toContain('w-64') // Collapsed width
    }
  })
})
