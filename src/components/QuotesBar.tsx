import { useState, useEffect } from 'react'
import { getRandomQuote, Quote } from '@/lib/quotes'
import { Quote as QuoteIcon } from '@phosphor-icons/react'

export function QuotesBar() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(() => getRandomQuote())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote())
    }, 3000) // Change quote every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-indigo-900/40 via-purple-900/30 to-transparent backdrop-blur-md border-t border-purple-400/20 p-3 lg:p-4 shadow-lg shadow-purple-500/10">
      <div className="max-w-md lg:max-w-4xl xl:max-w-6xl mx-auto flex items-center gap-3 lg:gap-4">
        <QuoteIcon size={16} className="lg:size-5 text-cyan-300 flex-shrink-0 mt-1 drop-shadow-sm" />
        <div className="flex-1 min-w-0 text-center">
          <p 
            className="text-xs lg:text-sm text-white/95 leading-relaxed transition-opacity duration-500 drop-shadow-sm font-medium"
            key={currentQuote.text} // Force re-render for animation
          >
            "{currentQuote.text}"
          </p>
          {currentQuote.author && (
            <p className="text-xs lg:text-sm text-cyan-200/80 mt-1 drop-shadow-sm">
              — {currentQuote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}