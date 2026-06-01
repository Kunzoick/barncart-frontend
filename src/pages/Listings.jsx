import { useEffect, useState, useCallback } from 'react'
import { getListings } from '../api/listings'
import ListingCard from '../components/listing/ListingCard'
import { Search } from 'lucide-react'

export default function Listings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    setLoading(true)
    setListings([])
    setPage(0)
    getListings(0, 12)
      .then(res => {
        const data = res.data
        setListings(data.content)
        setHasMore(!data.last)
        setTotalElements(data.totalElements)
      })
      .catch(() => setError('Failed to load listings. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  async function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const res = await getListings(nextPage, 12)
      const data = res.data
      setListings(prev => [...prev, ...data.content])
      setPage(nextPage)
      setHasMore(!data.last)
    } catch {
      setError('Failed to load more listings.')
    } finally {
      setLoadingMore(false)
    }
  }

  const categories = ['All', ...new Set(listings.map(l => l.category))]

  const filtered = listings.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory
    const matchesSearch = l.produceName.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch && l.batchStatus === 'ACTIVE'
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-farm-text mb-1">Fresh Produce</h1>
        <p className="text-sm text-gray-500">
          Sourced in small batches — limited stock, always fresh
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search produce..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
            placeholder:text-gray-400 bg-white"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium
              transition-colors ${
              activeCategory === cat
                ? 'bg-farm-green text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-farm-green hover:text-farm-green'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100
              aspect-[3/4] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No listings found.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">{totalElements} listings available</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(listing => (
              <ListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 border border-farm-green text-farm-green text-sm
                  font-medium rounded-lg hover:bg-farm-greenMuted transition-colors
                  disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}