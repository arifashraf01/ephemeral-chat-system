import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { over } from 'stompjs'

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a, #111827)',
  color: '#e5e7eb',
  padding: '32px 24px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
}

const cardStyle = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '20px',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
}

const listStyle = {
  marginTop: '12px',
  display: 'grid',
  gap: '10px',
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [receiverId, setReceiverId] = useState('')
  const [content, setContent] = useState('')
  const [typingNotice, setTypingNotice] = useState('')
  const clientRef = useRef(null)
  const receiverRef = useRef('')

  const parseMessage = (payload) => {
    try {
      return JSON.parse(payload.body)
    } catch (error) {
      console.warn('Failed to parse message body as JSON. Using raw payload.', error)
      return payload.body
    }
  }

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const stompClient = over(socket)
    clientRef.current = stompClient

    stompClient.connect({}, () => {
      console.log('WebSocket connected')
      stompClient.subscribe('/user/queue/messages', (payload) => {
        const message = parseMessage(payload)
        console.log('Received message', message)
        setMessages((prev) => [...prev, message])

        const senderId = message?.senderId || message?.from
        const messageId = message?.id || message?.messageId
        if (senderId && clientRef.current?.connected) {
          clientRef.current.send(
            '/app/chat.seen',
            {},
            JSON.stringify({ senderId, messageId })
          )
        }
      })

      stompClient.subscribe('/user/queue/typing', (payload) => {
        const message = parseMessage(payload)
        console.log('Typing event', message)
        setTypingNotice('User is typing...')
        setTimeout(() => setTypingNotice(''), 1500)
      })

      stompClient.subscribe('/user/queue/seen', (payload) => {
        const seen = parseMessage(payload)
        console.log('Seen event', seen)
        const seenId = seen?.messageId || seen?.id
        if (!seenId) return
        setMessages((prev) => prev.map((msg) => (msg.id === seenId ? { ...msg, status: 'SEEN' } : msg)))
      })

      if (receiverRef.current) {
        stompClient.send('/app/chat.open', {}, JSON.stringify({ receiverId: receiverRef.current }))
      }
    }, (error) => {
      console.error('WebSocket error', error)
    })

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        if (receiverRef.current) {
          clientRef.current.send('/app/chat.close', {}, JSON.stringify({ receiverId: receiverRef.current }))
        }
        clientRef.current.disconnect(() => console.log('WebSocket disconnected'))
      } else {
        socket.close()
      }
    }
  }, [])

  useEffect(() => {
    const trimmed = receiverId.trim()
    receiverRef.current = trimmed
    if (clientRef.current?.connected && trimmed) {
      clientRef.current.send('/app/chat.open', {}, JSON.stringify({ receiverId: trimmed }))
    }
  }, [receiverId])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 10px', fontSize: '26px' }}>Chat</h1>
        <p style={{ margin: 0, color: '#9ca3af' }}>Listening for private messages on /user/queue/messages</p>

        <div style={listStyle}>
          {messages.length === 0 && <div style={{ color: '#9ca3af' }}>No messages yet.</div>}
          {messages.map((msg, index) => (
            <div
              key={`${msg.id || index}`}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(167, 139, 250, 0.18))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {typeof msg === 'string' ? msg : msg.content || JSON.stringify(msg)}
              {msg.self && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                  {msg.status === 'SEEN' ? 'SEEN ✓✓' : 'SENT ✓'}
                </div>
              )}
            </div>
          ))}
        </div>

        {typingNotice && <p style={{ marginTop: '12px', color: '#a855f7' }}>{typingNotice}</p>}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!clientRef.current || !clientRef.current.connected) {
              alert('Not connected to chat yet.')
              return
            }
            if (!receiverId.trim() || !content.trim()) {
              return
            }
            const trimmedReceiver = receiverId.trim()
            const trimmedContent = content.trim()
            const localId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`

            clientRef.current.send(
              '/app/chat.send',
              {},
              JSON.stringify({ receiverId: trimmedReceiver, content: trimmedContent, messageId: localId })
            )
            setMessages((prev) => [...prev, { id: localId, to: trimmedReceiver, content: trimmedContent, self: true, status: 'SENT' }])
            setContent('')
          }}
          style={{ marginTop: '16px', display: 'grid', gap: '10px' }}
        >
          <input
            type="text"
            placeholder="Receiver ID"
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#e5e7eb',
              outline: 'none',
            }}
          />
          <textarea
            rows={3}
            placeholder="Type a message..."
            value={content}
            onChange={(event) => {
              const next = event.target.value
              setContent(next)
              if (clientRef.current && clientRef.current.connected && receiverId.trim()) {
                clientRef.current.send(
                  '/app/chat.typing',
                  {},
                  JSON.stringify({ receiverId: receiverId.trim(), typing: true })
                )
              }
            }}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: '#e5e7eb',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
              color: '#0b0b0b',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}