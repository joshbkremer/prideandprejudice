import { useState, useEffect } from 'react'
import BookCard from '../components/BookCard'
import BookModal from '../components/BookModal'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

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
        {/* Decorative background pattern */}
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

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.5rem', color: '#2d1a0e',
          textAlign: 'center', marginBottom: '2.5rem',
          fontStyle: 'italic',
        }}>
          The Collection
          <span style={{ display: 'block', fontSize: '0.85rem', color: '#9a7a5a', marginTop: '0.25rem', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {books.length} {books.length === 1 ? 'Edition' : 'Editions'}
          </span>
        </h2>

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

        {!loading && books.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.75rem',
          }}>
            {books.map((book) => (
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
