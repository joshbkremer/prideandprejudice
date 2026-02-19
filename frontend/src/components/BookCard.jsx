import { useState } from 'react'

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect width='300' height='400' fill='%232d1a0e'/%3E%3Crect x='20' y='20' width='260' height='360' fill='none' stroke='%238b6914' stroke-width='2'/%3E%3Ctext x='150' y='190' text-anchor='middle' fill='%23d4af37' font-family='serif' font-size='16' font-style='italic'%3EPride %26%3C/text%3E%3Ctext x='150' y='215' text-anchor='middle' fill='%23d4af37' font-family='serif' font-size='16' font-style='italic'%3EPrejudice%3C/text%3E%3Ctext x='150' y='250' text-anchor='middle' fill='%238b6914' font-family='serif' font-size='12'%3EJane Austen%3C/text%3E%3C/svg%3E"

const styles = {
  card: {
    background: '#fff9f0',
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    position: 'relative',
    paddingTop: '140%',
    background: '#2d1a0e',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(26,10,0,0.85) 0%, transparent 60%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1rem',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  overlayText: {
    color: '#faf6f0',
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
  },
  body: {
    padding: '1rem',
    flexGrow: 1,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2d1a0e',
    marginBottom: '0.25rem',
    lineHeight: 1.3,
  },
  meta: {
    fontFamily: "'Lato', sans-serif",
    fontSize: '0.8rem',
    color: '#7a5c3a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  condition: (cond) => ({
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '2px',
    fontSize: '0.7rem',
    letterSpacing: '0.05em',
    fontFamily: "'Lato', sans-serif",
    background: conditionColor(cond).bg,
    color: conditionColor(cond).text,
  }),
}

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

export default function BookCard({ book, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered
          ? '0 12px 28px rgba(0,0,0,0.2)'
          : '0 2px 8px rgba(0,0,0,0.15)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.imageWrap}>
        <img
          src={book.cover_image_url || PLACEHOLDER}
          alt={book.title}
          style={{
            ...styles.image,
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        <div style={{ ...styles.overlay, opacity: hovered ? 1 : 0 }}>
          {book.edition && (
            <span style={styles.overlayText}>{book.edition}</span>
          )}
          {book.publisher && (
            <span style={styles.overlayText}>{book.publisher}</span>
          )}
        </div>
      </div>
      <div style={styles.body}>
        <div style={styles.title}>{book.title}</div>
        <div style={styles.meta}>
          <span>{book.year_published || 'Year unknown'}</span>
          {book.condition && (
            <span style={styles.condition(book.condition)}>{book.condition}</span>
          )}
        </div>
      </div>
    </div>
  )
}
