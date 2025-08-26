import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QuotesBar } from '@/components/QuotesBar'

describe('QuotesBar Component', () => {
  it('should render without crashing', () => {
    render(<QuotesBar />)
    // Component should render without throwing errors
  })

  it('should display motivational content', () => {
    render(<QuotesBar />)
    
    // Should have some text content visible
    expect(document.body).toContainHTML('text-white/95')
    expect(document.body).toContainHTML('text-cyan-200/80')
    
    // Should contain quotes structure
    const quoteParagraphs = document.querySelectorAll('p')
    expect(quoteParagraphs.length).toBeGreaterThan(0)
  })
})
