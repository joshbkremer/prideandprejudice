import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const CONDITIONS = ['Mint', 'Very Good', 'Good', 'Fair', 'Poor']

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(10,5,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem',
  },
  modal: {
    background: '#faf6f0',
    borderRadius: '4px',
    maxWidth: '680px', width: '100%',
    maxHeight: '92vh', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    padding: '2rem',
    border: '1px solid #c9b99a',
    position: 'relative',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem', fontWeight: 700,
    color: '#1a0a00', marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem', fontStyle: 'italic',
    color: '#5a3e28', marginBottom: '0.75rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e8ddd0',
  },
  group: { marginBottom: '1rem' },
  label: {
    display: 'block', fontFamily: "'Lato', sans-serif",
    fontSize: '0.78rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#7a5c3a',
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '0.55rem 0.75rem',
    border: '1px solid #c9b99a', borderRadius: '2px',
    fontFamily: "'Lato', sans-serif", fontSize: '0.9rem',
    background: '#fff9f0', color: '#1a0a00',
    outline: 'none',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box',
    padding: '0.55rem 0.75rem',
    border: '1px solid #c9b99a', borderRadius: '2px',
    fontFamily: "'Lato', sans-serif", fontSize: '0.9rem',
    background: '#fff9f0', color: '#1a0a00',
    resize: 'vertical', minHeight: '90px', outline: 'none',
  },
  select: {
    width: '100%', boxSizing: 'border-box',
    padding: '0.55rem 0.75rem',
    border: '1px solid #c9b99a', borderRadius: '2px',
    fontFamily: "'Lato', sans-serif", fontSize: '0.9rem',
    background: '#fff9f0', color: '#1a0a00', outline: 'none',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btnPrimary: {
    background: '#722f37', color: '#faf6f0',
    border: 'none', borderRadius: '2px',
    padding: '0.65rem 1.5rem',
    fontFamily: "'Lato', sans-serif", fontSize: '0.85rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent', color: '#722f37',
    border: '1px solid #722f37', borderRadius: '2px',
    padding: '0.65rem 1.5rem',
    fontFamily: "'Lato', sans-serif", fontSize: '0.85rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    cursor: 'pointer', marginLeft: '0.75rem',
  },
  btnSmall: (variant) => ({
    background: 'transparent',
    border: `1px solid ${variant === 'danger' ? '#b71c1c' : variant === 'gold' ? '#8b6914' : '#7a5c3a'}`,
    color: variant === 'danger' ? '#b71c1c' : variant === 'gold' ? '#8b6914' : '#7a5c3a',
    borderRadius: '2px',
    padding: '0.2rem 0.5rem',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: '0.7rem',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    marginRight: '0.35rem',
  }),
  error: {
    background: '#fce4ec', color: '#b71c1c',
    padding: '0.6rem 1rem', borderRadius: '2px',
    marginBottom: '1rem', fontFamily: "'Lato', sans-serif",
    fontSize: '0.85rem',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  imageThumb: (isPrimary) => ({
    position: 'relative',
    border: `2px solid ${isPrimary ? '#d4af37' : '#c9b99a'}`,
    borderRadius: '3px',
    overflow: 'hidden',
    background: '#2d1a0e',
  }),
  thumbImg: {
    width: '100%',
    aspectRatio: '3/4',
    objectFit: 'cover',
    display: 'block',
  },
  thumbBadge: {
    position: 'absolute', top: '4px', left: '4px',
    background: '#d4af37', color: '#1a0a00',
    fontSize: '0.6rem', padding: '0.1rem 0.35rem',
    borderRadius: '2px', fontFamily: "'Lato', sans-serif",
    letterSpacing: '0.05em', textTransform: 'uppercase',
    fontWeight: 700,
  },
  thumbActions: {
    padding: '0.35rem', background: '#faf6f0',
    display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
  },
  addImageArea: {
    border: '2px dashed #c9b99a',
    borderRadius: '3px',
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    color: '#9a7a5a',
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.85rem',
    transition: 'border-color 0.2s, color 0.2s',
  },
  uploadingBar: {
    height: '3px', background: '#d4af37',
    borderRadius: '2px', marginTop: '0.5rem',
    animation: 'pulse 1s ease-in-out infinite',
  },
}

const EMPTY = {
  title: '', author: 'Jane Austen', year_published: '',
  description: '', edition: '', publisher: '',
  condition: '', acquisition_date: '', acquisition_notes: '',
}

export default function AdminBookForm({ book, token, onSaved, onCancel }) {
  const [form, setForm] = useState(
    book ? { ...EMPTY, ...book, year_published: book.year_published ?? '' } : EMPTY
  )
  const [images, setImages] = useState([])
  const [imagesLoading, setImagesLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // Load existing images when editing
  useEffect(() => {
    if (book?.id) {
      setImagesLoading(true)
      fetch(`${API}/books/${book.id}/images`)
        .then((r) => r.json())
        .then(setImages)
        .catch(() => {})
        .finally(() => setImagesLoading(false))
    }
  }, [book?.id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        year_published: form.year_published ? parseInt(form.year_published, 10) : null,
        acquisition_date: form.acquisition_date || null,
        condition: form.condition || null,
        edition: form.edition || null,
        publisher: form.publisher || null,
        acquisition_notes: form.acquisition_notes || null,
        description: form.description || null,
      }
      // Remove cover_image_url from payload — managed via book_images
      delete payload.cover_image_url

      const url = book ? `${API}/books/${book.id}` : `${API}/books`
      const method = book ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to save book')
      }
      const saved = await res.json()
      onSaved(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length || !book?.id) return
    setUploadProgress({ done: 0, total: files.length })
    setError('')
    const uploaded = []
    for (const file of files) {
      try {
        const data = new FormData()
        data.append('file', file)
        const res = await fetch(`${API}/books/${book.id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        })
        if (!res.ok) throw new Error(`Failed to upload "${file.name}"`)
        const newImg = await res.json()
        uploaded.push(newImg)
      } catch (err) {
        setError(err.message)
      }
      setUploadProgress((p) => ({ ...p, done: p.done + 1 }))
    }
    setImages((prev) => {
      // If the batch included a primary (first-ever upload), start fresh
      const hasPrimary = uploaded.some((i) => i.is_primary)
      if (hasPrimary && prev.length === 0) return uploaded
      return [...prev, ...uploaded]
    })
    setUploadProgress({ done: 0, total: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSetPrimary(imageId) {
    try {
      const res = await fetch(`${API}/books/${book.id}/images/${imageId}/primary`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to set primary')
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      )
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteImage(imageId) {
    try {
      await fetch(`${API}/books/${book.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const removed = images.find((i) => i.id === imageId)
      let updated = images.filter((i) => i.id !== imageId)
      // If we removed the primary and there are others, promote first
      if (removed?.is_primary && updated.length > 0) {
        updated = [{ ...updated[0], is_primary: true }, ...updated.slice(1)]
      }
      setImages(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const isEditing = Boolean(book?.id)

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={s.title}>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── Basic fields ── */}
          <div style={s.group}>
            <label style={s.label}>Title *</label>
            <input style={s.input} name="title" value={form.title} onChange={handleChange} required />
          </div>

          <div style={s.group}>
            <label style={s.label}>Author</label>
            <input style={s.input} name="author" value={form.author} onChange={handleChange} />
          </div>

          <div style={{ ...s.row, ...s.group }}>
            <div>
              <label style={s.label}>Year Published</label>
              <input style={s.input} type="number" name="year_published" value={form.year_published} onChange={handleChange} min="1700" max="2100" />
            </div>
            <div>
              <label style={s.label}>Condition</label>
              <select style={s.select} name="condition" value={form.condition} onChange={handleChange}>
                <option value="">— Select —</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ ...s.row, ...s.group }}>
            <div>
              <label style={s.label}>Edition</label>
              <input style={s.input} name="edition" value={form.edition} onChange={handleChange} placeholder="e.g. First Edition" />
            </div>
            <div>
              <label style={s.label}>Publisher</label>
              <input style={s.input} name="publisher" value={form.publisher} onChange={handleChange} placeholder="e.g. Penguin Classics" />
            </div>
          </div>

          <div style={s.group}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} name="description" value={form.description} onChange={handleChange} />
          </div>

          <div style={{ ...s.row, ...s.group }}>
            <div>
              <label style={s.label}>Acquisition Date</label>
              <input style={s.input} type="date" name="acquisition_date" value={form.acquisition_date} onChange={handleChange} />
            </div>
          </div>

          <div style={s.group}>
            <label style={s.label}>Acquisition Notes</label>
            <textarea style={{ ...s.textarea, minHeight: '60px' }} name="acquisition_notes" value={form.acquisition_notes} onChange={handleChange} />
          </div>

          {/* ── Images (only shown when editing a saved book) ── */}
          {isEditing && (
            <div style={s.group}>
              <h3 style={s.sectionTitle}>Images</h3>

              {imagesLoading && (
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.85rem', color: '#9a7a5a' }}>Loading images…</p>
              )}

              {!imagesLoading && images.length > 0 && (
                <div style={s.imageGrid}>
                  {images.map((img) => (
                    <div key={img.id} style={s.imageThumb(img.is_primary)}>
                      {img.is_primary && <span style={s.thumbBadge}>Cover</span>}
                      <img src={img.url} alt={img.caption || ''} style={s.thumbImg} />
                      <div style={s.thumbActions}>
                        {!img.is_primary && (
                          <button type="button" style={s.btnSmall('gold')} onClick={() => handleSetPrimary(img.id)}>
                            Set Cover
                          </button>
                        )}
                        <button type="button" style={s.btnSmall('danger')} onClick={() => handleDeleteImage(img.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!imagesLoading && images.length === 0 && (
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.85rem', color: '#9a7a5a', marginBottom: '0.75rem' }}>
                  No images yet — add one below.
                </p>
              )}

              {/* Upload new images */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                disabled={uploadProgress.total > 0}
              />
              {(() => {
                const uploading = uploadProgress.total > 0
                return (
                  <div
                    style={{
                      ...s.addImageArea,
                      borderColor: uploading ? '#d4af37' : '#c9b99a',
                      color: uploading ? '#8b6914' : '#9a7a5a',
                      cursor: uploading ? 'default' : 'pointer',
                    }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {uploading
                      ? `Uploading ${uploadProgress.done} of ${uploadProgress.total}…`
                      : '+ Add Images'}
                    {uploading && <div style={s.uploadingBar} />}
                  </div>
                )
              })()}
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.75rem', color: '#b89a7a', marginTop: '0.4rem' }}>
                Select one or more images. The one marked "Cover" appears in the gallery.
              </p>
            </div>
          )}

          {!isEditing && (
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.8rem', color: '#9a7a5a', marginBottom: '1rem' }}>
              Save the book first, then reopen it to add images.
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" style={s.btnPrimary} disabled={saving}>
              {saving ? 'Saving…' : 'Save Book'}
            </button>
            <button type="button" style={s.btnSecondary} onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
