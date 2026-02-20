import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Admin from './pages/Admin'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf6f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic', color: '#9a7a5a',
      }}>
        Loading…
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Navbar session={session} />
      <Routes>
        <Route path="/" element={<Home session={session} />} />
        <Route path="/admin" element={<Admin session={session} />} />
      </Routes>
    </BrowserRouter>
  )
}
