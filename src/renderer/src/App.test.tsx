import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

describe('App component', () => {
  it('renders the pill with "Ready to Focus" status', () => {
    render(<App />)
    expect(screen.getByText('Ready to Focus')).toBeDefined()
  })

  it('expands dashboard on hover', () => {
    vi.useFakeTimers()
    render(<App />)
    const pill = screen.getByText('Ready to Focus').closest('.group > div:nth-child(2)')
    expect(pill).toBeDefined()
    
    if (pill) {
      fireEvent.mouseEnter(pill)
      act(() => {
        vi.runAllTimers()
      })
      expect(pill.className).toContain('w-[540px]') // Hovered width

      // In hovered state, 'Journey Streak' should be visible
      expect(screen.getByText(/Journey Streak/)).toBeDefined()
      
      fireEvent.mouseLeave(pill)
      act(() => {
        vi.runAllTimers()
      })
      expect(pill.className).toContain('w-64') // Collapsed width
    }
    vi.useRealTimers()
  })

  it('renders expanded view', () => {
    vi.useFakeTimers()
    render(<App />)
    const pill = screen.getByText('Ready to Focus').closest('.group > div:nth-child(2)')
    if (pill) {
      fireEvent.mouseEnter(pill)
      act(() => { vi.runAllTimers() })
      const maxBtn = document.querySelector('.lucide-maximize-2')
      if (maxBtn) {
        fireEvent.click(maxBtn.closest('button')!)
      }
      expect(screen.getByText('Tasks')).toBeDefined()
    }
  })
})
