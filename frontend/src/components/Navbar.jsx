import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const styles = {
  nav: {
    background: '#1a0a00',
    borderBottom: '2px solid #8b6914',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: '#d4af37',
    textDecoration: 'none',
    letterSpacing: '0.05em',
    fontStyle: 'italic',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#c9b99a',
    textDecoration: 'none',
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  button: {
    background: 'transparent',
    border: '1px solid #8b6914',
    color: '#d4af37',
    padding: '0.35rem 1rem',
    borderRadius: '2px',
    cursor: 'pointer',
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
  },
}

export default function Navbar({ session }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        Pride &amp; Prejudice Collection
      </Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Gallery</Link>
        {session ? (
          <>
            <Link to="/admin" style={styles.link}>Manage</Link>
            <button style={styles.button} onClick={handleLogout}>Sign Out</button>
          </>
        ) : (
          <Link to="/admin" style={styles.link}>Admin</Link>
        )}
      </div>
    </nav>
  )
}
