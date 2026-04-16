import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URLS } from '../config'

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at top left, #d7f8e2 0%, #7ddda5 35%, #3cbf79 100%)',
}

const cardStyle = {
  width: '100%',
  maxWidth: '420px',
  background: 'linear-gradient(165deg, rgba(232, 255, 239, 0.94), rgba(191, 245, 209, 0.9))',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '32px',
  color: '#0f172a',
  boxShadow: '0 20px 60px rgba(16, 58, 39, 0.24), inset 0 1px 0 rgba(255,255,255,0.6)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(22, 163, 74, 0.25)',
  background: 'rgba(240, 253, 244, 0.92)',
  color: '#14532d',
  fontSize: '15px',
  marginBottom: '14px',
  outline: 'none',
}

const buttonStyle = {
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  borderRadius: '12px',
  background: 'linear-gradient(145deg, #22c55e, #16a34a)',
  color: '#ecfdf5',
  fontWeight: 700,
  fontSize: '15px',
  cursor: 'pointer',
  boxShadow: '0 12px 30px rgba(22, 101, 52, 0.35)',
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
        console.log('Sending OTP for email:', email)
        const response = await fetch(API_URLS.authSendOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          const text = await response.text()
          console.log('BACKEND ERROR:', text)
          alert(text)
          return
        }

        setStep(2)
      } catch {
        alert('Failed to send OTP. Please try again.')
      }
      return
    }

    try {
      const response = await fetch(API_URLS.authVerifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      })

      if (!response.ok) {
        throw new Error('Signup failed')
      }

      navigate('/login')
    } catch {
      alert('Verification failed. Please check the OTP and try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '18px', fontSize: '24px', letterSpacing: '0.3px', color: '#14532d' }}>Create account</h2>
        <p style={{ marginBottom: '20px', color: '#166534' }}>
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
