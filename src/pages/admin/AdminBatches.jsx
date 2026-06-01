import { useState, useEffect } from 'react'
import { getAdminBatches, createBatch, cancelBatch, getProduce } from '../../api/admin'
import { Plus, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_STYLES = {
  ACTIVE:    'bg-farm-greenMuted text-farm-green',
  EXPIRED:   'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-red-100 text-red-600',
  DEPLETED:  'bg-amber-100 text-amber-700',
}

const EMPTY_FORM = {
  produceId: '',
  quantityOriginal: '',
  harvestedAt: '',
  expiryDate: '',
  notes: '',
}

function BatchRow({ batch, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Cancel this batch? Stock will no longer be available.')) return
    setLoading(true)
    try {
      await onCancel(batch.id)
    } finally {
      setLoading(false)
    }
  }

  const pctRemaining = batch.quantityOriginal > 0
    ? Math.round((batch.quantityAvailable / batch.quantityOriginal) * 100)
    : 0

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[batch.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {batch.status}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-farm-text">{batch.produceName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Harvested {batch.harvestedAt} · Expires {batch.expiryDate}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-farm-text">
            {batch.quantityAvailable} / {batch.quantityOriginal}
          </p>
          <p className="text-xs text-gray-500">{pctRemaining}% remaining</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          {/* Stock bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-farm-green h-2 rounded-full transition-all"
              style={{ width: `${pctRemaining}%` }}
            />
          </div>
          {batch.notes && (
            <p className="text-sm text-gray-600">Notes: {batch.notes}</p>
          )}
          <p className="text-xs text-gray-400">Batch ID: {batch.id}</p>
          {batch.status === 'ACTIVE' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              <XCircle size={15} />
              {loading ? 'Cancelling...' : 'Cancel Batch'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CreateBatchModal({ produce, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.produceId || !form.quantityOriginal || !form.harvestedAt || !form.expiryDate) {
      setError('Produce, quantity, harvest date and expiry date are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await createBatch({
        produceId: form.produceId,
        quantityOriginal: Number(form.quantityOriginal),
        harvestedAt: form.harvestedAt,
        expiryDate: form.expiryDate,
        notes: form.notes || null,
      })
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create batch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">New Harvest Batch</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Produce</label>
            <select
              name="produceId"
              value={form.produceId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green"
            >
              <option value="">Select produce...</option>
              {produce.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
            <input
              type="number"
              name="quantityOriginal"
              value={form.quantityOriginal}
              onChange={handleChange}
              placeholder="e.g. 100"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Harvested At</label>
              <input
                type="date"
                name="harvestedAt"
                value={form.harvestedAt}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any notes about this batch..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBatches() {
  const [batches, setBatches] = useState([])
  const [produce, setProduce] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [batchRes, produceRes] = await Promise.all([
        getAdminBatches(),
        getProduce(),
      ])
      setBatches(batchRes.data.content ?? batchRes.data)
      setProduce(produceRes.data.filter(p => p.active))
    } catch {
      setError('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(batchId) {
    await cancelBatch(batchId)
    setBatches(prev => prev.map(b =>
      b.id === batchId ? { ...b, status: 'CANCELLED' } : b
    ))
  }

  function handleCreated(newBatch) {
    setBatches(prev => [newBatch, ...prev])
  }

  const statuses = ['ACTIVE', 'EXPIRED', 'CANCELLED', 'DEPLETED']
  const counts = statuses.reduce((acc, s) => {
    acc[s] = batches.filter(b => b.status === s).length
    return acc
  }, {})

  const filtered = statusFilter === 'ALL'
    ? batches
    : batches.filter(b => b.status === statusFilter)

  if (loading) return <div className="text-gray-500 text-sm">Loading batches...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-farm-text">Harvest Batches</h1>
          <p className="text-gray-500 text-sm mt-1">{batches.length} total batches</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={15} />
          New Batch
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-farm-green text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-farm-green'
          }`}
        >
          All ({batches.length})
        </button>
        {statuses.map(s => counts[s] > 0 && (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-farm-green text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-farm-green'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Batch list */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No batches with status {statusFilter}.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(batch => (
            <BatchRow key={batch.id} batch={batch} onCancel={handleCancel} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <CreateBatchModal
          produce={produce}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}