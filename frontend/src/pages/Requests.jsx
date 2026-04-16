import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URLS } from '../config'

const pageStyle = {
  minHeight: '100vh',
  padding: '32px 24px',
  background: 'radial-gradient(circle at top left, #d7f8e2 0%, #7ddda5 35%, #3cbf79 100%)',
  color: '#0f172a',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '18px',
}

const sectionStyle = {
  background: 'linear-gradient(165deg, rgba(232, 255, 239, 0.94), rgba(191, 245, 209, 0.9))',
  borderRadius: '16px',
  padding: '18px',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 18px 40px rgba(16, 58, 39, 0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
}

const cardStyle = {
  padding: '14px',
  borderRadius: '12px',
  background: 'linear-gradient(145deg, rgba(240, 253, 244, 0.95), rgba(220, 252, 231, 0.85))',
  border: '1px solid rgba(22, 163, 74, 0.18)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  boxShadow: '0 10px 24px rgba(21, 128, 61, 0.16)',
}

const badgeBase = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.3px',
}

const statusStyles = {
  PENDING: { ...badgeBase, background: 'rgba(253, 224, 71, 0.35)', color: '#854d0e', border: '1px solid rgba(234, 179, 8, 0.45)' },
  ACCEPTED: { ...badgeBase, background: 'rgba(74, 222, 128, 0.25)', color: '#166534', border: '1px solid rgba(22, 163, 74, 0.35)' },
  REJECTED: { ...badgeBase, background: 'rgba(251, 113, 133, 0.22)', color: '#881337', border: '1px solid rgba(225, 29, 72, 0.35)' },
}

const buttonRow = {
  display: 'flex',
  gap: '8px',
}

const actionButton = (bg, color) => ({
  padding: '8px 12px',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '13px',
  background: bg,
  color,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
})

export default function Requests() {
  const [incoming, setIncoming] = useState([])
  const [sent, setSent] = useState([])
  const [receiverEmail, setReceiverEmail] = useState('')
  const navigate = useNavigate()

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const currentEmail = (() => {
    try {
      if (!token) return ''
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload?.sub || ''
    } catch {
      return ''
    }
  })()

  const acceptedChatPartners = Array.from(new Set([
    ...incoming.filter((item) => item.status === 'ACCEPTED').map((item) => item.senderEmail),
    ...sent.filter((item) => item.status === 'ACCEPTED').map((item) => item.receiverEmail),
  ]))

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const authHeaders = () => {
    if (!token) {
      alert('You must be logged in to manage requests.')
      throw new Error('Missing token')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  const fetchRequests = async () => {
    try {
      const [incomingResponse, sentResponse] = await Promise.all([
        fetch(API_URLS.requestsIncoming, {
          method: 'GET',
          headers: authHeaders(),
        }),
        fetch(API_URLS.requestsSent, {
          method: 'GET',
          headers: authHeaders(),
        }),
      ])

      if (!incomingResponse.ok || !sentResponse.ok) {
        throw new Error('Failed to fetch requests')
      }

      const incomingData = await incomingResponse.json()
      const sentData = await sentResponse.json()

      setIncoming(incomingData)
      setSent(sentData)
    } catch {
      alert('Failed to load requests.')
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleSend = async (event) => {
    event.preventDefault()
    if (!receiverEmail.trim()) return

    try {
      const response = await fetch(API_URLS.requestsSend, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ receiverEmail: receiverEmail.trim() }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        alert(data?.message || 'Failed to send request.')
        return
      }

      // Optimistic add to sent list
      await fetchRequests()
      setReceiverEmail('')
      alert(data?.message || 'Request sent')
    } catch {
      alert('Failed to send request. Please try again.')
    }
  }

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(API_URLS.requestsAccept(requestId), {
        method: 'POST',
        headers: authHeaders(),
      })

      if (!response.ok) {
        throw new Error('Accept failed')
      }

      setIncoming((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'ACCEPTED' } : item)))
    } catch {
      alert('Failed to accept request. Please try again.')
    }
  }

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(API_URLS.requestsReject(requestId), {
        method: 'POST',
        headers: authHeaders(),
      })

      if (!response.ok) {
        throw new Error('Reject failed')
      }

      setIncoming((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'REJECTED' } : item)))
    } catch {
      alert('Failed to reject request. Please try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#166534', margin: 0, fontSize: '14px', letterSpacing: '0.4px' }}>Stay on top of conversations</p>
            <h1 style={{ margin: '6px 0 0', fontSize: '30px', letterSpacing: '0.4px', color: '#14532d' }}>Chat Requests</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(6, 78, 59, 0.18)',
              background: 'rgba(220, 252, 231, 0.75)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#065f46',
            }}>
              {currentEmail || 'Profile'}
            </span>
            <button
              type="button"
              style={actionButton('linear-gradient(135deg, #fb7185, #ef4444)', '#0b0b0b')}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={handleSend} style={{ marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter receiver email"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(22, 163, 74, 0.25)',
              background: 'rgba(240, 253, 244, 0.92)',
              color: '#14532d',
              fontSize: '14px',
              outline: 'none',
            }}
            value={receiverEmail}
            onChange={(event) => setReceiverEmail(event.target.value)}
          />
          <button
            type="submit"
            style={actionButton('linear-gradient(135deg, #38bdf8, #a855f7)', '#0b0b0b')}
          >
            Send
          </button>
        </form>

        <div style={gridStyle}>
          <section style={sectionStyle}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', letterSpacing: '0.3px' }}>Incoming Requests</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {incoming.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.senderEmail}</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534' }}>Incoming</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={statusStyles[item.status]}>{item.status}</span>
                    {item.status === 'PENDING' && (
                      <div style={buttonRow}>
                        <button
                          type="button"
                          style={actionButton('linear-gradient(135deg, #22c55e, #16a34a)', '#0b0b0b')}
                          onClick={() => handleAccept(item.id)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          style={actionButton('linear-gradient(135deg, #fb7185, #ef4444)', '#0b0b0b')}
                          onClick={() => handleReject(item.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', letterSpacing: '0.3px' }}>Sent Requests</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {sent.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.receiverEmail}</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534' }}>Sent</div>
                  </div>
                  <span style={statusStyles[item.status]}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={{ ...sectionStyle, marginTop: '18px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '18px', letterSpacing: '0.3px' }}>Accepted Chats</h3>
          {acceptedChatPartners.length === 0 && (
            <p style={{ margin: 0, color: '#166534' }}>No accepted chats yet.</p>
          )}
          <div style={{ display: 'grid', gap: '10px' }}>
            {acceptedChatPartners.map((email) => (
              <div key={email} style={cardStyle}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{email}</div>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#166534' }}>Ready to chat</div>
                </div>
                <button
                  type="button"
                  style={actionButton('linear-gradient(135deg, #38bdf8, #22c55e)', '#0b0b0b')}
                  onClick={() => navigate(`/chat?partner=${encodeURIComponent(email)}`)}
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}