import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { over } from 'stompjs'

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1f0a3c, #8b1fa9, #ff6f61)',
  color: '#e5e7eb',
  padding: '32px 24px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const cardStyle = {
  width: '100%',
  maxWidth: '820px',
  height: '80vh',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(14px)',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
}

const listStyle = {
  flex: 1,
  marginTop: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  overflowY: 'auto',
  paddingRight: '4px',
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [partnerEmail, setPartnerEmail] = useState('')
  const [content, setContent] = useState('')
  const [typingNotice, setTypingNotice] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef(null)
  const fadeStyleId = 'chat-fade-keyframes'
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
  const hasChat = chats.length > 0

  const parseMessage = (payload) => {
    try {
      return JSON.parse(payload.body)
    } catch (error) {
      console.warn('Failed to parse message body as JSON. Using raw payload.', error)
      return payload.body
    }
  }

  const fetchChats = async () => {
    if (!token) return
    try {
      const response = await fetch('http://localhost:8080/chats', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : []
      setChats(list)

      if (list.length > 0 && currentEmail) {
        const first = list[0]
        const nextPartner = first.user1Email === currentEmail ? first.user2Email : first.user1Email
        setPartnerEmail(nextPartner || '')
      }
    } catch (error) {
      console.error('Failed to fetch chats', error)
      setChats([])
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (!document.getElementById(fadeStyleId)) {
      const styleTag = document.createElement('style')
      styleTag.id = fadeStyleId
      styleTag.innerHTML = `@keyframes messageFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`
      document.head.appendChild(styleTag)
    }

    const socket = new SockJS('http://localhost:8080/ws')
    const stompClient = over(socket)
    stompClient.debug = () => {}
    clientRef.current = stompClient

    stompClient.connect({}, () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      if (!currentEmail) return

      stompClient.subscribe(`/topic/messages/${currentEmail}`, (payload) => {
        const message = parseMessage(payload)
        console.log('Received message', message)
        setMessages((prev) => [...prev, message])

        const senderEmail = message?.sender?.email || message?.senderEmail
        const messageId = message?.id || message?.messageId
        if (senderEmail && clientRef.current?.connected) {
          clientRef.current.send(
            '/app/chat.seen',
            {},
            JSON.stringify({ senderEmail, messageId })
          )
        }
      })

      stompClient.subscribe(`/topic/typing/${currentEmail}`, (payload) => {
        const message = parseMessage(payload)
        console.log('Typing event', message)
        setTypingNotice('User is typing...')
        setTimeout(() => setTypingNotice(''), 1500)
      })

      stompClient.subscribe(`/topic/seen/${currentEmail}`, (payload) => {
        const seen = parseMessage(payload)
        console.log('Seen event', seen)
        const seenId = seen?.messageId || seen?.id
        if (!seenId) return
        setMessages((prev) => prev.map((msg) => (msg.id === seenId ? { ...msg, status: 'SEEN' } : msg)))
      })
    }, (error) => {
      setIsConnected(false)
      console.error('WebSocket error', error)
    })

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.disconnect(() => console.log('WebSocket disconnected'))
      } else {
        socket.close()
      }
      setIsConnected(false)
    }
  }, [])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '26px' }}>Chat</h1>
            <p style={{ margin: 0, color: '#cbd5e1' }}>Private messages and typing indicators</p>
          </div>
          <span style={{
            padding: '8px 12px',
            borderRadius: '999px',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.4px',
            background: hasChat
              ? 'linear-gradient(135deg, #22c55e, #10b981)'
              : 'linear-gradient(135deg, #fbbf24, #f97316)',
            color: '#0b0b0b',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.25)',
          }}>
            {hasChat ? (isConnected ? 'CHAT ACTIVE' : 'CONNECTING...') : 'NO CHAT FOUND'}
          </span>
        </div>

        {!hasChat && (
          <div style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '14px',
            border: '1px dashed rgba(255, 255, 255, 0.25)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
            textAlign: 'center',
            color: '#fef3c7',
          }}>
            No chat entity found for this user yet.
          </div>
        )}

          <div style={listStyle}>
            {messages.length === 0 && <div style={{ color: '#9ca3af' }}>No messages yet.</div>}
            {messages.map((msg, index) => {
              const isSelf = msg.self
              return (
                <div
                  key={`${msg.id || index}`}
                  style={{
                    display: 'flex',
                    justifyContent: isSelf ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelf
                        ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.8), rgba(168, 85, 247, 0.85))'
                        : 'linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(30, 41, 59, 0.85))',
                      color: '#f8fafc',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      animation: 'messageFade 0.35s ease',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {typeof msg === 'string' ? msg : msg.content || JSON.stringify(msg)}
                    {msg.self && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#e2e8f0', textAlign: 'right' }}>
                        {msg.status === 'SEEN' ? 'SEEN ✓✓' : 'SENT ✓'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {typingNotice && <p style={{ marginTop: '8px', color: '#a855f7' }}>{typingNotice}</p>}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!clientRef.current || !clientRef.current.connected || !isConnected) {
              return
            }
            if (!partnerEmail || !content.trim() || !currentEmail) {
              return
            }
            const trimmedContent = content.trim()
            const localId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`

            clientRef.current.send(
              '/app/chat.send',
              {},
              JSON.stringify({ senderEmail: currentEmail, receiverEmail: partnerEmail, content: trimmedContent, messageId: localId })
            )
            setMessages((prev) => [...prev, { id: localId, content: trimmedContent, self: true, status: 'SENT' }])
            setContent('')
          }}
          style={{
            marginTop: '14px',
            display: 'grid',
            gap: '10px',
            opacity: 1,
            pointerEvents: 'auto',
          }}
        >
            <div style={{ display: 'flex', gap: '10px' }}>
              <div
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#e5e7eb',
                }}
              >
                {partnerEmail || 'No chat partner selected'}
              </div>
              <button
                type="submit"
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8, #fb7185)',
                  color: '#0b0b0b',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
                  opacity: isConnected && hasChat ? 1 : 0.6,
                }}
                disabled={!isConnected || !hasChat || !partnerEmail}
              >
                Send
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Type a message..."
              value={content}
              onChange={(event) => {
                const next = event.target.value
                setContent(next)
                if (clientRef.current && clientRef.current.connected && isConnected && partnerEmail && currentEmail) {
                  clientRef.current.send(
                    '/app/chat.typing',
                    {},
                    JSON.stringify({ senderEmail: currentEmail, receiverEmail: partnerEmail, typing: true })
                  )
                }
              }}
              style={{
                padding: '12px 14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#e5e7eb',
                outline: 'none',
                resize: 'vertical',
              }}
            />
        </form>
      </div>
    </div>
  )
}