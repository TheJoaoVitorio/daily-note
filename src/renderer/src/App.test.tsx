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
    vi.useRealTimers()
  })

  it('renders category chart in hovered state and categories in settings', () => {
    vi.useFakeTimers()
    render(<App />)
    const pill = screen.getByText('Ready to Focus').closest('.group > div:nth-child(2)')
    if (pill) {
      fireEvent.mouseEnter(pill)
      act(() => { vi.runAllTimers() })
      expect(screen.getByText('Completed by Category')).toBeDefined()

      // Open expanded
      const maxBtn = document.querySelector('.lucide-maximize-2')
      if (maxBtn) {
        fireEvent.click(maxBtn.closest('button')!)
      }
      // Open settings
      const settingsBtn = document.querySelector('.lucide-settings')
      if (settingsBtn) {
        fireEvent.click(settingsBtn.closest('button')!)
      }
      expect(screen.getByText('Categories')).toBeDefined()
      expect(screen.getByPlaceholderText('Category name')).toBeDefined()
    }
    vi.useRealTimers()
  })
})
