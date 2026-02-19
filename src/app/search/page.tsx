'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { VideoGrid } from '@/components/VideoGrid'
import { FaSearch } from 'react-icons/fa'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q, sortBy)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string, sort: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setVideos([])
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: searchQuery,
          sortBy: sort,
        },
      })
      setVideos(response.data.videos)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    performSearch(query, newSort)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-surface border border-gray-700 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-primary"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-semibold"
          >
            Search
          </button>
        </div>
      </form>

      {/* Sort options */}
      {videos.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <span className="text-textSecondary">Sort by:</span>
          <button
            onClick={() => handleSortChange('relevance')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'relevance'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surfaceHover'
            }`}
          >
            Relevance
          </button>
          <button
            onClick={() => handleSortChange('recent')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'recent'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surfaceHover'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => handleSortChange('views')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'views'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-surfaceHover'
            }`}
          >
            Most Viewed
          </button>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-2xl">Searching...</div>
        </div>
      ) : query && videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl mb-2">No results found</div>
          <p className="text-textSecondary">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : videos.length > 0 ? (
        <>
          <div className="mb-4">
            <span className="text-textSecondary">
              {total.toLocaleString()} result{total !== 1 ? 's' : ''} for "{query}"
            </span>
          </div>
          <VideoGrid videos={videos} />
        </>
      ) : (
        <div className="text-center py-12 text-textSecondary">
          <FaSearch className="text-6xl mx-auto mb-4 opacity-50" />
          <p>Enter a search query to find videos</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8"><div className="text-center py-12 text-textSecondary">Loading...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
