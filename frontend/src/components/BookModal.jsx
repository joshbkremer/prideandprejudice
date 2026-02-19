import { useState, useEffect, useCallback } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232d1a0e'/%3E%3Crect x='20' y='20' width='260' height='360' fill='none' stroke='%238b6914' stroke-width='2'/%3E%3Ctext x='150' y='190' text-anchor='middle' fill='%23d4af37' font-family='serif' font-size='16' font-style='italic'%3EPride %26%3C/text%3E%3Ctext x='150' y='215' text-anchor='middle' fill='%23d4af37' font-family='serif' font-size='16' font-style='italic'%3EPrejudice%3C/text%3E%3Ctext x='150' y='250' text-anchor='middle' fill='%238b6914' font-family='serif' font-size='12'%3EJane Austen%3C/text%3E%3C/svg%3E"

function conditionColor(cond) {
  const map = {
    Mint: { bg: '#e8f5e9', text: '#2e7d32' },
    'Very Good': { bg: '#e3f2fd', text: '#1565c0' },
    Good: { bg: '#fff8e1', text: '#f57f17' },
    Fair: { bg: '#fff3e0', text: '#e65100' },
    Poor: { bg: '#fce4ec', text: '#b71c1c' },
  }
  return map[cond] || { bg: '#f5f5f5', text: '#616161' }
}

export default function BookModal({ book, onClose }) {
  const [images, setImages] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (!book) return
    fetch(`${API}/books/${book.id}/images`)
      .then((r) => r.json())
      .then((imgs) => {
        setImages(imgs)
        const primaryIdx = imgs.findIndex((i) => i.is_primary)
        setActiveIdx(primaryIdx >= 0 ? primaryIdx : 0)
      })
      .catch(() => setImages([]))
  }, [book?.id])

  const prev = useCallback(() => setActiveIdx((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && images.length > 1) prev()
      if (e.key === 'ArrowRight' && images.length > 1) next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next, images.length])

  if (!book) return null

  const cc = book.condition ? conditionColor(book.condition) : null
  const activeImage = images[activeIdx]
  const displayUrl = activeImage?.url || book.cover_image_url || PLACEHOLDER

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,5,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#faf6f0',
          borderRadius: '4px',
          maxWidth: '1200px', width: '100%',
          maxHeight: '92vh', overflow: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'row',
          border: '1px solid #c9b99a',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.4rem', color: '#7a5c3a', lineHeight: 1, zIndex: 10,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* ── Image panel ── */}
        <div style={{ flexShrink: 0, width: '460px', background: '#1a0a00', display: 'flex', flexDirection: 'column' }}>
          {/* Main image */}
          <div style={{ position: 'relative', flexGrow: 1, minHeight: '520px' }}>
            <img
              src={displayUrl}
              alt={activeImage?.caption || book.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prev} style={arrowBtn('left')} aria-label="Previous image">‹</button>
                <button onClick={next} style={arrowBtn('right')} aria-label="Next image">›</button>
                <div style={{
                  position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.55)', color: '#d4af37',
                  fontFamily: "'Lato', sans-serif", fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem', borderRadius: '10px', letterSpacing: '0.08em',
                }}>
                  {activeIdx + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{
              display: 'flex', gap: '4px', padding: '6px',
              overflowX: 'auto', background: '#120700', flexShrink: 0,
            }}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    flexShrink: 0, width: '44px', height: '58px',
                    padding: 0,
                    border: `2px solid ${idx === activeIdx ? '#d4af37' : 'transparent'}`,
                    borderRadius: '2px', cursor: 'pointer', overflow: 'hidden',
                    background: '#2d1a0e',
                  }}
                >
                  <img src={img.url} alt={img.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          {/* Caption */}
          {activeImage?.caption && (
            <div style={{
              padding: '0.4rem 0.6rem', background: '#120700',
              fontFamily: "'Lato', sans-serif", fontSize: '0.75rem',
              color: '#9a7a5a', fontStyle: 'italic', flexShrink: 0,
            }}>
              {activeImage.caption}
            </div>
          )}
        </div>

        {/* ── Details panel ── */}
        <div style={{ padding: '2rem 2.5rem', flexGrow: 1, overflowY: 'auto' }}>
          <div style={{ color: '#8b6914', fontSize: '1.1rem', letterSpacing: '0.4em', marginBottom: '0.5rem' }}>
            ✦ ✦ ✦
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.75rem', fontWeight: 700,
            color: '#1a0a00', marginBottom: '0.25rem', lineHeight: 1.2,
          }}>
            {book.title}
          </h2>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#5a3e28',
            fontSize: '1rem', marginBottom: '1.25rem',
          }}>
            {book.author}
          </p>

          <div style={{ height: '1px', background: 'linear-gradient(to right, #d4af37, transparent)', marginBottom: '1.25rem' }} />

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '0.6rem 1.5rem', marginBottom: '1.5rem',
            fontFamily: "'Lato', sans-serif",
          }}>
            {book.year_published && <MetaRow label="Year Published" value={book.year_published} />}
            {book.edition && <MetaRow label="Edition" value={book.edition} />}
            {book.publisher && <MetaRow label="Publisher" value={book.publisher} />}
            {book.condition && (
              <div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a7a5a', marginBottom: '0.2rem' }}>Condition</div>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.6rem',
                  borderRadius: '2px', fontSize: '0.8rem',
                  background: cc.bg, color: cc.text, fontWeight: 700,
                }}>
                  {book.condition}
                </span>
              </div>
            )}
            {book.acquisition_date && (
              <MetaRow label="Acquired" value={new Date(book.acquisition_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })} />
            )}
          </div>

          {book.description && (
            <>
              <div style={{ height: '1px', background: 'linear-gradient(to right, #d4af37, transparent)', marginBottom: '1.25rem' }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', color: '#5a3e28', fontStyle: 'italic', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: '#3a2810' }}>{book.description}</p>
            </>
          )}

          {book.acquisition_notes && (
            <>
              <div style={{ height: '1px', background: 'linear-gradient(to right, #d4af37, transparent)', margin: '1.25rem 0' }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.95rem', color: '#5a3e28', fontStyle: 'italic', marginBottom: '0.5rem' }}>Acquisition Notes</h3>
              <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: '#3a2810' }}>{book.acquisition_notes}</p>
            </>
          )}

          <div style={{ color: '#8b6914', fontSize: '0.9rem', letterSpacing: '0.4em', marginTop: '2rem', textAlign: 'center' }}>
            ✦ ✦ ✦
          </div>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a7a5a', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', color: '#2d1a0e' }}>{value}</div>
    </div>
  )
}

function arrowBtn(side) {
  return {
    position: 'absolute', top: '50%',
    [side]: '6px',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.45)',
    border: 'none', color: '#d4af37',
    fontSize: '1.6rem', lineHeight: 1,
    width: '32px', height: '32px',
    borderRadius: '2px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 5,
  }
}
