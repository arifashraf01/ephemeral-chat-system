import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'linear-gradient(135deg, #0ea5e9, #f97316)',
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
  background: 'linear-gradient(135deg, #22d3ee, #f97316)',
  color: '#0b0b0b',
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 600,
  fontSize: '14px',
}

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (step === 1) {
      try {
        const response = await fetch('http://localhost:8080/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          throw new Error('OTP request failed')
        }

        setStep(2)
      } catch (error) {
        alert('Failed to send OTP. Please try again.')
      }
      return
    }

    try {
      const response = await fetch('http://localhost:8080/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      navigate('/login')
    } catch (error) {
      alert('Verification failed. Please check the OTP and try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '18px', fontSize: '24px', letterSpacing: '0.3px' }}>Create account</h2>
        <p style={{ marginBottom: '20px', color: 'rgba(248, 249, 250, 0.75)' }}>
          We will send an OTP to verify your email.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            style={inputStyle}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={step === 2}
          />

          {step === 2 && (
            <>
              <label style={labelStyle}>OTP</label>
              <input
                type="text"
                placeholder="Enter the code"
                style={inputStyle}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />

              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                style={inputStyle}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </>
          )}

          <button type="submit" style={buttonStyle}>
            {step === 1 ? 'Send OTP' : 'Verify & Signup'}
          </button>
        </form>
      </div>
    </div>
  )
}