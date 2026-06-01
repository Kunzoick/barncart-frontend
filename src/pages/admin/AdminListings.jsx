import { useState, useEffect } from 'react'
import { getAdminListings, createListing, deactivateListing, getAdminBatches } from '../../api/admin'
import { Plus, PowerOff } from 'lucide-react'

const EMPTY_FORM = {
  batchId: '',
  retailPrice: '',
  bulkPrice: '',
  minBulkQuantity: '',
  currency: 'CAD',
  lowStockThresholdPct: '20',
  bagWeightKg: '',
}

function CreateListingModal({ batches, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.batchId || !form.retailPrice || !form.bulkPrice || !form.minBulkQuantity) {
      setError('Batch, retail price, bulk price and min bulk quantity are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await createListing({
        batchId: form.batchId,
        retailPrice: Number(form.retailPrice),
        bulkPrice: Number(form.bulkPrice),
        minBulkQuantity: Number(form.minBulkQuantity),
        currency: form.currency,
        lowStockThresholdPct: Number(form.lowStockThresholdPct),
        bagWeightKg: form.bagWeightKg ? Number(form.bagWeightKg) : null,
      })
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  const activeBatches = batches.filter(b => b.status === 'ACTIVE')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">New Listing</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Batch</label>
            <select
              name="batchId"
              value={form.batchId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green"
            >
              <option value="">Select active batch...</option>
              {activeBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.produceName} — {b.quantityAvailable} available (exp {b.expiryDate})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Retail Price (CAD)</label>
              <input type="number" name="retailPrice" value={form.retailPrice} onChange={handleChange}
                placeholder="e.g. 5.00"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bulk Price (CAD)</label>
              <input type="number" name="bulkPrice" value={form.bulkPrice} onChange={handleChange}
                placeholder="e.g. 4.00"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Bulk Qty</label>
              <input type="number" name="minBulkQuantity" value={form.minBulkQuantity} onChange={handleChange}
                placeholder="e.g. 10"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bag Weight kg (optional)</label>
              <input type="number" name="bagWeightKg" value={form.bagWeightKg} onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Threshold %</label>
            <input type="number" name="lowStockThresholdPct" value={form.lowStockThresholdPct}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [listRes, batchRes] = await Promise.all([
        getAdminListings(),
        getAdminBatches(),
      ])
      setListings(listRes.data.content ?? listRes.data)
      setBatches(batchRes.data)
    } catch {
      setError('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeactivate(listingId) {
    if (!confirm('Deactivate this listing? It will no longer appear to customers.')) return
    await deactivateListing(listingId)
    setListings(prev => prev.filter(l => l.listingId !== listingId))
  }

  function handleCreated(newListing) {
    setListings(prev => [newListing, ...prev])
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading listings...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-farm-text">Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{listings.length} active listings</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          <Plus size={15} /> New Listing
        </button>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-400 text-sm">No listings yet.</p>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.listingId}
              className="border border-gray-200 rounded-lg bg-white px-5 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-farm-text">{listing.produceName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {listing.category} · {listing.unit}
                  {listing.bagWeightKg ? ` · ${listing.bagWeightKg}kg/bag` : ''}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Expires {listing.expiryDate} · {listing.quantityAvailable} available
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-farm-text">
                  ${Number(listing.retailPrice).toFixed(2)} retail
                </p>
                <p className="text-xs text-farm-amber">
                  ${Number(listing.bulkPrice).toFixed(2)} bulk (min {listing.minBulkQuantity})
                </p>
              </div>
              {listing.batchStatus === 'ACTIVE' && (
                <button onClick={() => handleDeactivate(listing.listingId)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-md transition-colors shrink-0">
                  <PowerOff size={13} /> Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateListingModal
          batches={batches}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}