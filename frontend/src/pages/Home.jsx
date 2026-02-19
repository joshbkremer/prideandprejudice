import { useState, useEffect, useMemo } from 'react'
import BookCard from '../components/BookCard'
import BookModal from '../components/BookModal'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const SORT_OPTIONS = [
  { value: 'year_published',  label: 'Year Published', defaultDir: 'asc'  },
  { value: 'acquisition_date', label: 'Date Acquired', defaultDir: 'desc' },
  { value: 'created_at',       label: 'Date Added',    defaultDir: 'desc' },
]

function sortBooks(books, key, dir) {
  return [...books].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    // Nulls always go last regardless of direction
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const asc = key === 'year_published' ? av - bv : new Date(av) - new Date(bv)
    return dir === 'asc' ? asc : -asc
  })
}

const quillDivider = (
  <div style={{ textAlign: 'center', margin: '1.5rem 0', color: '#8b6914', fontSize: '1.2rem', letterSpacing: '0.5em' }}>
    ❦ ❧
  </div>
)

export default function Home() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [sortBy, setSortBy]   = useState('year_published')
  const [sortDir, setSortDir] = useState('asc')

  function handleSortKeyChange(key) {
    const opt = SORT_OPTIONS.find((o) => o.value === key)
    setSortBy(key)
    setSortDir(opt.defaultDir)
  }

  useEffect(() => {
    fetch(`${API}/books`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch books')
        return r.json()
      })
      .then(setBooks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const sorted = useMemo(() => sortBooks(books, sortBy, sortDir), [books, sortBy, sortDir])

  return (
    <div style={{ minHeight: '100vh', background: '#faf6f0' }}>
      {/* Hero */}
      <header style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1a0e 50%, #1a0a00 100%)',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.06) 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, rgba(212,175,55,0.06) 0%, transparent 50%)`,
        }} />

        <div style={{ position: 'relative' }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#8b6914',
            fontSize: '0.95rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            A Curated Collection
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 700, color: '#d4af37',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            Pride &amp; Prejudice
          </h1>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#c9b99a',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            marginBottom: '1.5rem',
          }}>
            by Jane Austen
          </p>

          <div style={{ color: '#8b6914', fontSize: '1.4rem', letterSpacing: '0.6em' }}>✦ ✦ ✦</div>

          <p style={{
            fontFamily: "'Lato', sans-serif",
            color: '#9a7a5a', fontSize: '0.95rem',
            maxWidth: '520px', margin: '1.5rem auto 0',
            lineHeight: 1.7, letterSpacing: '0.02em',
          }}>
            "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife..."
          </p>
        </div>
      </header>

      {/* Collection */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        {quillDivider}

        {/* Heading + sort control */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem', color: '#2d1a0e',
            fontStyle: 'italic', margin: 0,
          }}>
            The Collection
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#9a7a5a', marginTop: '0.25rem', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {books.length} {books.length === 1 ? 'Edition' : 'Editions'}
            </span>
          </h2>

          {books.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <label style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: '0.72rem', textTransform: 'uppercase',
                letterSpacing: '0.1em', color: '#9a7a5a',
                whiteSpace: 'nowrap',
              }}>
                Sort by
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortKeyChange(e.target.value)}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: '0.82rem',
                    color: '#2d1a0e',
                    background: '#fff9f0',
                    border: '1px solid #c9b99a',
                    borderRadius: '2px',
                    padding: '0.4rem 2rem 0.4rem 0.75rem',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span style={{
                  position: 'absolute', right: '0.5rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8b6914', fontSize: '0.65rem', pointerEvents: 'none',
                }}>▾</span>
              </div>
              {/* Direction toggle */}
              <button
                onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                style={{
                  background: '#fff9f0',
                  border: '1px solid #c9b99a',
                  borderRadius: '2px',
                  width: '30px', height: '30px',
                  cursor: 'pointer',
                  color: '#8b6914',
                  fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', fontFamily: "'Lato', sans-serif", color: '#9a7a5a', padding: '4rem' }}>
            Loading the collection…
          </p>
        )}

        {error && (
          <p style={{
            textAlign: 'center', color: '#b71c1c',
            fontFamily: "'Lato', sans-serif", padding: '2rem',
            background: '#fce4ec', borderRadius: '4px',
          }}>
            {error}
          </p>
        )}

        {!loading && !error && books.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#9a7a5a', fontSize: '1.1rem' }}>
              The shelves await their first volume.
            </p>
            <p style={{ fontFamily: "'Lato', sans-serif", color: '#b89a7a', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Log in as admin to start adding books to the collection.
            </p>
          </div>
        )}

        {!loading && sorted.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.75rem',
          }}>
            {sorted.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => setSelected(book)} />
            ))}
          </div>
        )}

        {quillDivider}
      </main>

      {selected && <BookModal book={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
