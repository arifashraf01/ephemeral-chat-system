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
  const clientRef = useRef(null)

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
      })
    }, (error) => {
      console.error('WebSocket error', error)
    })

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.disconnect(() => console.log('WebSocket disconnected'))
      } else {
        socket.close()
      }
    }
  }, [])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 10px', fontSize: '26px' }}>Chat</h1>
        <p style={{ margin: 0, color: '#9ca3af' }}>Listening for private messages on /user/queue/messages</p>

        <div style={listStyle}>
          {messages.length === 0 && <div style={{ color: '#9ca3af' }}>No messages yet.</div>}
          {messages.map((msg, index) => (
            <div
              key={`${msg}-${index}`}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(167, 139, 250, 0.18))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {typeof msg === 'string' ? msg : JSON.stringify(msg)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}