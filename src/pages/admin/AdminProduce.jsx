import { useState, useEffect } from 'react'
import { getProduce, createProduce, getCategories, createCategory, deactivateProduceItem, updateCategory, uploadProduceImage } from '../../api/admin'
import { Plus, PowerOff, Tag, Upload} from 'lucide-react'

const UNITS = ['KG', 'G', 'LB', 'PIECE', 'BAG']

const EMPTY_PRODUCE_FORM = {
  categoryId: '', name: '', description: '', unit: 'KG',
}
const EMPTY_CATEGORY_FORM = { name: '', refundWindowDays: '3' }

function CreateCategoryModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Category name is required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await createCategory({
        name: form.name.trim(),
        refundWindowDays: Number(form.refundWindowDays),
      })
      onCreated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create category')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">New Category</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Vegetables"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Refund Window (days)</label>
            <input type="number" value={form.refundWindowDays}
              onChange={e => setForm(p => ({ ...p, refundWindowDays: e.target.value }))}
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
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditCategoryModal({ category, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: category.name,
    refundWindowDays: String(category.refundWindowDays),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Category name is required.'); return }
    setLoading(true); setError(null)
    try {
      const res = await updateCategory(category.id, {
        name: form.name.trim(),
        refundWindowDays: Number(form.refundWindowDays),
      })
      onUpdated(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to update category')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">Edit Category</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category Name</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-farm-green" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Refund Window (days)</label>
            <input type="number" value={form.refundWindowDays}
              onChange={e => setForm(p => ({ ...p, refundWindowDays: e.target.value }))}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateProduceModal({ categories, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_PRODUCE_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError(null)
  }

  async function handleSubmit() {
    if (!form.categoryId || !form.name.trim()) {
      setError('Category and name are required.')
      return
    }
    setLoading(true); setError(null)
    try {
      const res = await createProduce({
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description || null,
        unit: form.unit,
        imageUrl: null,
      })
      const newProduce = res.data
      //upload image if selected
      if(imageFile) {
        const imgRes = await uploadProduceImage(newProduce.id, imageFile)
      onCreated(imgRes.data)
      } else {
        onCreated(newProduce)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create produce')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-farm-text">New Produce</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green">
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Tomatoes"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description (optional)
            </label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={2} placeholder="Short description..."
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green">
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Image (optional)
            </label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed
              border-gray-300 rounded-md px-3 py-3 hover:border-farm-green transition-colors">
              <Upload size={15} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {imageFile ? imageFile.name : 'Click to upload image'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="hidden" />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="preview"
                className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-200" />
            )}
            <p className="text-xs text-gray-400 mt-1">Max 5MB. JPG, PNG, WEBP.</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium
              py-2 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-farm-green hover:bg-farm-greenLight text-white text-sm
              font-medium py-2 rounded-md transition-colors disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Produce'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProduce() {
  const [produce, setProduce] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProduceModal, setShowProduceModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      setLoading(true)
      const [produceRes, catRes] = await Promise.all([getProduce(), getCategories()])
      setProduce(produceRes.data)
      setCategories(catRes.data)
    } catch {
      setError('Failed to load produce')
    } finally { setLoading(false) }
  }

  function handleProduceCreated(p) { setProduce(prev => [p, ...prev]) }
  function handleCategoryCreated(c) { setCategories(prev => [...prev, c]) }
  function handleCategoryUpdated(updated) {
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this produce? It will no longer be available for new batches.')) return
    await deactivateProduceItem(id)
    setProduce(prev => prev.map(p => p.id === id ? { ...p, active: false } : p))
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading produce...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-farm-text">Produce</h1>
          <p className="text-gray-500 text-sm mt-1">
            {produce.length} produce items · {categories.length} categories
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 border border-farm-green text-farm-green text-sm font-medium px-4 py-2 rounded-md hover:bg-farm-greenMuted transition-colors">
            <Tag size={15} /> New Category
          </button>
          <button onClick={() => setShowProduceModal(true)}
            className="flex items-center gap-2 bg-farm-green hover:bg-farm-greenLight text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
            <Plus size={15} /> New Produce
          </button>
        </div>
      </div>

      {/* Categories strip with edit */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c.id}
              onClick={() => setEditingCategory(c)}
              className="px-3 py-1 bg-farm-greenMuted text-farm-green text-xs font-medium rounded-full hover:bg-farm-green hover:text-white transition-colors">
              {c.name} · {c.refundWindowDays}d refund ✎
            </button>
          ))}
        </div>
      )}

      {/* Produce list */}
      {produce.length === 0 ? (
        <p className="text-gray-400 text-sm">No produce yet.</p>
      ) : (
        <div className="space-y-3">
          {produce.map(p => (
            <div key={p.id}
              className={`border border-gray-200 rounded-lg bg-white px-5 py-4 flex items-center gap-4 ${!p.active ? 'opacity-50' : ''}`}>
              <div className="w-12 h-12 rounded-md bg-gray-100 shrink-0 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-farm-text">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.categoryName} · {p.unit}
                  {!p.active && <span className="ml-2 text-red-400 font-medium">Inactive</span>}
                </p>
                {p.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{p.description}</p>
                )}
              </div>
              {p.active && (
                <button onClick={() => handleDeactivate(p.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-md transition-colors shrink-0">
                  <PowerOff size={13} /> Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showProduceModal && (
        <CreateProduceModal
          categories={categories}
          onClose={() => setShowProduceModal(false)}
          onCreated={handleProduceCreated}
        />
      )}
      {showCategoryModal && (
        <CreateCategoryModal
          onClose={() => setShowCategoryModal(false)}
          onCreated={handleCategoryCreated}
        />
      )}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onUpdated={handleCategoryUpdated}
        />
      )}
    </div>
  )
}