import { useEffect, useState } from 'react'

const pageStyle = {
  minHeight: '100vh',
  padding: '32px 24px',
  background: 'linear-gradient(145deg, #0f172a, #1e293b)',
  color: '#e2e8f0',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '18px',
}

const sectionStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '16px',
  padding: '18px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',
}

const cardStyle = {
  padding: '14px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(56, 189, 248, 0.12))',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
}

const badgeBase = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.3px',
}

const statusStyles = {
  PENDING: { ...badgeBase, background: 'rgba(251, 191, 36, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.35)' },
  ACCEPTED: { ...badgeBase, background: 'rgba(34, 197, 94, 0.18)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.35)' },
  REJECTED: { ...badgeBase, background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.35)' },
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

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
        fetch('http://localhost:8080/requests/incoming', {
          method: 'GET',
          headers: authHeaders(),
        }),
        fetch('http://localhost:8080/requests/sent', {
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
    } catch (error) {
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
      const response = await fetch('http://localhost:8080/requests/send', {
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
    } catch (error) {
      alert('Failed to send request. Please try again.')
    }
  }

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch('http://localhost:8080/requests/accept', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) {
        throw new Error('Accept failed')
      }

      setIncoming((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'ACCEPTED' } : item)))
    } catch (error) {
      alert('Failed to accept request. Please try again.')
    }
  }

  const handleReject = async (requestId) => {
    try {
      const response = await fetch('http://localhost:8080/requests/reject', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) {
        throw new Error('Reject failed')
      }

      setIncoming((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'REJECTED' } : item)))
    } catch (error) {
      alert('Failed to reject request. Please try again.')
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', letterSpacing: '0.4px' }}>Stay on top of conversations</p>
          <h1 style={{ margin: '6px 0 0', fontSize: '30px', letterSpacing: '0.4px' }}>Chat Requests</h1>
        </div>

        <form onSubmit={handleSend} style={{ marginBottom: '18px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter receiver email"
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#e2e8f0',
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
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#cbd5e1' }}>Incoming</div>
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
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#cbd5e1' }}>Sent</div>
                  </div>
                  <span style={statusStyles[item.status]}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}