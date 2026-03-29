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

const incomingRequests = [
  { id: 1, email: 'alice@example.com', status: 'PENDING' },
  { id: 2, email: 'bob@example.com', status: 'ACCEPTED' },
  { id: 3, email: 'carol@example.com', status: 'REJECTED' },
]

const sentRequests = [
  { id: 11, email: 'mentor@chat.io', status: 'PENDING' },
  { id: 12, email: 'friend@ping.me', status: 'ACCEPTED' },
]

export default function Requests() {
  const handleAccept = (who) => alert(`Accepted request from ${who}`)
  const handleReject = (who) => alert(`Rejected request from ${who}`)

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px', letterSpacing: '0.4px' }}>Stay on top of conversations</p>
          <h1 style={{ margin: '6px 0 0', fontSize: '30px', letterSpacing: '0.4px' }}>Chat Requests</h1>
        </div>

        <div style={gridStyle}>
          <section style={sectionStyle}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', letterSpacing: '0.3px' }}>Incoming Requests</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {incomingRequests.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.email}</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#cbd5e1' }}>Incoming</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={statusStyles[item.status]}>{item.status}</span>
                    {item.status === 'PENDING' && (
                      <div style={buttonRow}>
                        <button
                          type="button"
                          style={actionButton('linear-gradient(135deg, #22c55e, #16a34a)', '#0b0b0b')}
                          onClick={() => handleAccept(item.email)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          style={actionButton('linear-gradient(135deg, #fb7185, #ef4444)', '#0b0b0b')}
                          onClick={() => handleReject(item.email)}
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
              {sentRequests.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.email}</div>
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