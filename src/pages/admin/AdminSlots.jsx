import { useState, useEffect } from 'react'
import { getAdminSlots, createSlot } from '../../api/admin'
import { Plus, Users } from 'lucide-react'

const SLOT_TYPES = ['MORNING', 'EVENING']

const TYPE_STYLES = {
  MORNING: 'bg-amber-50 text-amber-700 border-amber-200',
  EVENING: 'bg-blue-50 text-blue-700 border-blue-200',
}

function getDateRange() {
  const from = new Date()
  const to = new Date()
  to.setDate(to.getDate() + 60)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

function CreateSlotModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ slotDate: '', slotType: 'MORNING', capacity: '10' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.slotDate) { setError('Slot date is required.'); return }
    setLoading(true)
    setError(null)
    try {
      const res = await createSlot({
        slotDate: form.slotDate,
        slotType: form.slotType,
        capacity: Number(form.capacity),
      })
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">New Delivery Slot</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" name="slotDate" value={form.slotDate} onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slot Type</label>
            <select name="slotType" value={form.slotType} onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green">
              {SLOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
            <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
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
            {loading ? 'Creating...' : 'Create Slot'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSlots() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchSlots() }, [])

  async function fetchSlots() {
    try {
      setLoading(true)
      const { from, to } = getDateRange()
      const res = await getAdminSlots(from, to)
      setSlots(res.data)
    } catch {
      setError('Failed to load slots')
    } finally {
      setLoading(false)
    }
  }

  function handleCreated(newSlot) {
    setSlots(prev => [...prev, newSlot].sort((a, b) =>
      a.slotDate.localeCompare(b.slotDate) || a.slotType.localeCompare(b.slotType)
    ))
  }

  // Group slots by date
  const grouped = slots.reduce((acc, slot) => {
    if (!acc[slot.slotDate]) acc[slot.slotDate] = []
    acc[slot.slotDate].push(slot)
    return acc
  }, {})

  if (loading) return <div className="text-gray-500 text-sm">Loading slots...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-farm-text">Delivery Slots</h1>
          <p className="text-gray-500 text-sm mt-1">Next 30 days · {slots.length} slots</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
          <Plus size={15} /> New Slot
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 text-sm">No slots in the next 30 days.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySlots]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {new Date(date + 'T12:00:00').toLocaleDateString('en-CA', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {daySlots.map(slot => {
                  const pct = Math.round((slot.bookedCount / slot.capacity) * 100)
                  const full = !slot.available
                  return (
                    <div key={slot.id}
                      className={`border rounded-lg p-4 bg-white ${full ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${TYPE_STYLES[slot.slotType]}`}>
                          {slot.slotType}
                        </span>
                        {full && (
                          <span className="text-xs text-red-500 font-medium">FULL</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-farm-text">
                        <Users size={13} className="text-gray-400" />
                        {slot.bookedCount} / {slot.capacity}
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${full ? 'bg-red-400' : 'bg-farm-green'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateSlotModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}