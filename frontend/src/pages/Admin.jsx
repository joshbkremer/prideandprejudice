import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminBookForm from '../components/AdminBookForm'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const s = {
  page: { minHeight: '100vh', background: '#faf6f0', padding: '3rem 2rem', maxWidth: '960px', margin: '0 auto' },
  heading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.75rem', color: '#1a0a00',
    marginBottom: '0.25rem',
  },
  sub: {
    fontFamily: "'Lato', sans-serif",
    color: '#7a5c3a', fontSize: '0.9rem', marginBottom: '2rem',
  },
  loginCard: {
    maxWidth: '420px', margin: '4rem auto',
    background: '#fff9f0', border: '1px solid #c9b99a',
    borderRadius: '4px', padding: '2.5rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  },
  loginTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.4rem', color: '#1a0a00',
    textAlign: 'center', marginBottom: '0.5rem',
  },
  loginSub: {
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.82rem', color: '#9a7a5a',
    textAlign: 'center', marginBottom: '2rem',
  },
  label: {
    display: 'block', fontFamily: "'Lato', sans-serif",
    fontSize: '0.78rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#7a5c3a', marginBottom: '0.3rem',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '0.6rem 0.75rem',
    border: '1px solid #c9b99a', borderRadius: '2px',
    fontFamily: "'Lato', sans-serif", fontSize: '0.9rem',
    background: '#fff9f0', color: '#1a0a00', outline: 'none',
    marginBottom: '1rem',
  },
  btnPrimary: {
    width: '100%', background: '#722f37', color: '#faf6f0',
    border: 'none', borderRadius: '2px',
    padding: '0.75rem', cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: '0.85rem',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  error: {
    background: '#fce4ec', color: '#b71c1c',
    padding: '0.6rem 1rem', borderRadius: '2px',
    marginBottom: '1rem', fontFamily: "'Lato', sans-serif",
    fontSize: '0.85rem',
  },
  addBtn: {
    background: '#722f37', color: '#faf6f0',
    border: 'none', borderRadius: '2px',
    padding: '0.6rem 1.4rem', cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: '0.8rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: '2rem',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: "'Lato', sans-serif", fontSize: '0.72rem',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#7a5c3a', padding: '0.6rem 0.75rem',
    borderBottom: '2px solid #c9b99a', textAlign: 'left',
  },
  td: {
    fontFamily: "'Lato', sans-serif", fontSize: '0.875rem',
    color: '#1a0a00', padding: '0.75rem',
    borderBottom: '1px solid #e8ddd0', verticalAlign: 'middle',
  },
  editBtn: {
    background: 'transparent', border: '1px solid #8b6914',
    color: '#8b6914', borderRadius: '2px',
    padding: '0.25rem 0.65rem', cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: '0.75rem',
    marginRight: '0.5rem',
  },
  deleteBtn: {
    background: 'transparent', border: '1px solid #b71c1c',
    color: '#b71c1c', borderRadius: '2px',
    padding: '0.25rem 0.65rem', cursor: 'pointer',
    fontFamily: "'Lato', sans-serif", fontSize: '0.75rem',
  },
  thumbnail: {
    width: '40px', height: '52px',
    objectFit: 'cover', borderRadius: '2px',
    background: '#2d1a0e',
  },
}

export default function Admin({ session }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [books, setBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const token = session?.access_token

  useEffect(() => {
    if (session) loadBooks()
  }, [session])

  async function handleLogin(e) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  async function loadBooks() {
    setBooksLoading(true)
    try {
      const res = await fetch(`${API}/books`)
      const data = await res.json()
      setBooks(data)
    } finally {
      setBooksLoading(false)
    }
  }

  async function handleDelete(book) {
    if (deleteConfirm !== book.id) {
      setDeleteConfirm(book.id)
      return
    }
    await fetch(`${API}/books/${book.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setDeleteConfirm(null)
    loadBooks()
  }

  function handleSaved() {
    setShowForm(false)
    setEditingBook(null)
    loadBooks()
  }

  // Login screen
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#faf6f0' }}>
        <div style={s.loginCard}>
          <h2 style={s.loginTitle}>Admin Access</h2>
          <p style={s.loginSub}>Sign in to manage the collection</p>
          {authError && <div style={s.error}>{authError}</div>}
          <form onSubmit={handleLogin}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <button style={s.btnPrimary} type="submit" disabled={authLoading}>
              {authLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Admin panel
  return (
    <div style={{ minHeight: '100vh', background: '#faf6f0' }}>
      <div style={s.page}>
        <h1 style={s.heading}>Manage Collection</h1>
        <p style={s.sub}>Signed in as {session.user?.email}</p>

        <button style={s.addBtn} onClick={() => { setEditingBook(null); setShowForm(true) }}>
          + Add New Book
        </button>

        {booksLoading && <p style={{ fontFamily: "'Lato', sans-serif", color: '#9a7a5a' }}>Loading…</p>}

        {!booksLoading && books.length === 0 && (
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#9a7a5a' }}>
            No books yet. Add your first edition!
          </p>
        )}

        {!booksLoading && books.length > 0 && (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Cover</th>
                <th style={s.th}>Title</th>
                <th style={s.th}>Year</th>
                <th style={s.th}>Edition</th>
                <th style={s.th}>Condition</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} style={{ background: deleteConfirm === book.id ? '#fff0f0' : 'transparent' }}>
                  <td style={s.td}>
                    {book.cover_image_url
                      ? <img src={book.cover_image_url} alt="" style={s.thumbnail} />
                      : <div style={{ ...s.thumbnail, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b6914', fontSize: '1.2rem' }}>📖</div>
                    }
                  </td>
                  <td style={s.td}>
                    <strong>{book.title}</strong>
                    <br />
                    <span style={{ color: '#7a5c3a', fontSize: '0.8rem' }}>{book.author}</span>
                  </td>
                  <td style={s.td}>{book.year_published || '—'}</td>
                  <td style={s.td}>{book.edition || '—'}</td>
                  <td style={s.td}>{book.condition || '—'}</td>
                  <td style={s.td}>
                    <button
                      style={s.editBtn}
                      onClick={() => { setEditingBook(book); setShowForm(true) }}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        ...s.deleteBtn,
                        background: deleteConfirm === book.id ? '#b71c1c' : 'transparent',
                        color: deleteConfirm === book.id ? '#fff' : '#b71c1c',
                      }}
                      onClick={() => handleDelete(book)}
                    >
                      {deleteConfirm === book.id ? 'Confirm' : 'Delete'}
                    </button>
                    {deleteConfirm === book.id && (
                      <button
                        style={{ ...s.editBtn, marginLeft: '0.5rem', marginRight: 0 }}
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AdminBookForm
          book={editingBook}
          token={token}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditingBook(null) }}
        />
      )}
    </div>
  )
}
