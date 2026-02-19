'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  videoCount: number
}

interface CategorySliderProps {
  categories: Category[]
  currentSlug?: string
}

export function CategorySlider({ categories, currentSlug }: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    window.addEventListener('resize', checkScrollButtons)
    return () => window.removeEventListener('resize', checkScrollButtons)
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
      setTimeout(checkScrollButtons, 300)
    }
  }

  if (categories.length === 0) return null

  return (
    <div className="relative mb-6 sm:mb-8">
      <div className="flex items-center gap-4 mb-3 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Browse Categories</h2>
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-surface p-2 sm:p-3 rounded-full shadow-lg opacity-0 md:group-hover:opacity-100 md:opacity-0 opacity-70 transition-opacity"
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-base sm:text-xl" />
          </button>
        )}

        {/* Categories slider */}
        <div
          ref={scrollRef}
          onScroll={checkScrollButtons}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-2 px-2 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {/* All Videos */}
          <Link
            href="/"
            className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base ${
              !currentSlug
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-gray-800 text-textSecondary hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🎬</span>
              <span className="whitespace-nowrap">All Videos</span>
            </div>
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base ${
                currentSlug === category.slug
                  ? 'text-white'
                  : 'bg-surface hover:bg-gray-800 text-textSecondary hover:text-white'
              }`}
              style={{
                backgroundColor: currentSlug === category.slug ? category.color || '#ff006e' : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                {category.icon && <span className="text-base sm:text-lg">{category.icon}</span>}
                <span className="whitespace-nowrap">{category.name}</span>
                <span className="text-xs opacity-75">({category.videoCount})</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-surface p-2 sm:p-3 rounded-full shadow-lg opacity-0 md:group-hover:opacity-100 md:opacity-0 opacity-70 transition-opacity"
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-base sm:text-xl" />
          </button>
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
