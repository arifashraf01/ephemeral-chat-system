import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'linear-gradient(135deg, #3a0ca3, #ff006e)',
}

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '32px',
  color: '#f8f9fa',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  background: 'rgba(255, 255, 255, 0.08)',
  color: '#f8f9fa',
  fontSize: '15px',
  marginBottom: '14px',
  outline: 'none',
}

const buttonStyle = {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #ff8fa3, #ff4d6d)',
  color: '#0b0b0b',
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
  boxShadow: '0 12px 30px rgba(255, 77, 109, 0.35)',
}

const mutedText = {
  marginTop: '14px',
  fontSize: '14px',
  color: 'rgba(248, 249, 250, 0.85)',
  textAlign: 'center',
}

const linkStyle = {
  color: '#ffb3c1',
  fontWeight: 600,
  marginLeft: '6px',
  textDecoration: 'none',
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data?.token) {
        throw new Error('Login failed')
      }

      localStorage.setItem('token', data.token)
      navigate('/requests')
    } catch (error) {
      alert('Login failed. Please check your credentials and try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '18px', fontSize: '24px', letterSpacing: '0.3px' }}>Welcome back</h2>
        <p style={{ marginBottom: '20px', color: 'rgba(248, 249, 250, 0.75)' }}>
          Sign in to continue the chat.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            style={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            style={inputStyle}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" style={buttonStyle}>Login</button>
        </form>

        <div style={mutedText}>
          Don't have an account?
          <Link to="/signup" style={linkStyle}>Signup</Link>
        </div>
      </div>
    </div>
  )
}