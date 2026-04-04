import { useEffect, useRef, useState } from 'react'
import SockJS from 'sockjs-client'
import { over } from 'stompjs'
import { useLocation } from 'react-router-dom'

const containerStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #d7f8e2 0%, #7ddda5 35%, #3cbf79 100%)',
  color: '#0f172a',
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
  background: 'linear-gradient(165deg, rgba(232, 255, 239, 0.94), rgba(191, 245, 209, 0.9))',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 25px 60px rgba(16, 58, 39, 0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
  backdropFilter: 'blur(10px)',
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
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [chats, setChats] = useState([])
  const [partnerEmail, setPartnerEmail] = useState('')
  const [content, setContent] = useState('')
  const [typingNotice, setTypingNotice] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef(null)
  const partnerRef = useRef('')
  const messagesRef = useRef(null)
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
  const preferredPartnerFromQuery = new URLSearchParams(location.search).get('partner') || ''
  const hasChat = chats.length > 0
  const partnerName = partnerEmail ? partnerEmail.split('@')[0] : 'Unknown'

  useEffect(() => {
    partnerRef.current = partnerEmail
  }, [partnerEmail])

  const toChatPartners = (chatList) => {
    if (!currentEmail) return []
    const partners = chatList
      .map((chat) => (chat.user1Email === currentEmail ? chat.user2Email : chat.user1Email))
      .filter(Boolean)
    return [...new Set(partners)]
  }

  const normalizeMessage = (raw) => {
    if (!raw || typeof raw !== 'object') {
      return null
    }
    const senderEmail = raw.senderEmail || raw?.sender?.email || ''
    const receiverEmail = raw.receiverEmail || raw?.receiver?.email || ''
    const id = raw.id || raw.messageId || `${Date.now()}-${Math.random()}`
    return {
      id,
      senderEmail,
      receiverEmail,
      content: raw.content || '',
      status: raw.status || 'SENT',
      self: senderEmail === currentEmail,
    }
  }

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
        const partners = toChatPartners(list)
        const nextPartner = partners.includes(preferredPartnerFromQuery)
          ? preferredPartnerFromQuery
          : partners[0]
        setPartnerEmail(nextPartner || '')
      }
    } catch (error) {
      console.error('Failed to fetch chats', error)
      setChats([])
    }
  }

  useEffect(() => {
    fetchChats()
  }, [location.search])

  useEffect(() => {
    const fetchConversation = async () => {
      if (!token || !partnerEmail) {
        setMessages([])
        return
      }

      try {
        const response = await fetch(`http://localhost:8080/messages/conversation?partnerEmail=${encodeURIComponent(partnerEmail)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch conversation')
        }

        const data = await response.json()
        const list = Array.isArray(data) ? data : []
        setMessages(list.map(normalizeMessage).filter(Boolean))
      } catch (error) {
        console.error('Failed to fetch conversation', error)
      }
    }

    fetchConversation()
  }, [partnerEmail])

  useEffect(() => {
    if (!document.getElementById(fadeStyleId)) {
      const styleTag = document.createElement('style')
      styleTag.id = fadeStyleId
      styleTag.innerHTML = `
        @keyframes messageFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .chat-scroll-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .chat-scroll-hidden::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `
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
        const normalized = normalizeMessage(message)
        if (!normalized) return

        const activePartner = partnerRef.current
        const isForActiveConversation =
          normalized.senderEmail === activePartner || normalized.receiverEmail === activePartner

        if (isForActiveConversation) {
          setMessages((prev) => [...prev, normalized])
        }

        const senderEmail = normalized.senderEmail
        const messageId = normalized.id
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
        const seenId =
          typeof seen === 'number' || typeof seen === 'string'
            ? String(seen)
            : String(seen?.messageId || seen?.id || '')
        if (!seenId) return
        setMessages((prev) => prev.map((msg) => (String(msg.id) === seenId ? { ...msg, status: 'SEEN' } : msg)))
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

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, partnerEmail])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '26px', color: '#064e3b' }}>Chat</h1>
            <p style={{ margin: 0, color: '#166534' }}>Private messages and typing indicators</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              padding: '8px 12px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.4px',
              background: hasChat
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : 'linear-gradient(135deg, #fde047, #f59e0b)',
              color: '#052e16',
              boxShadow: '0 10px 24px rgba(5, 46, 22, 0.2)',
            }}>
              {hasChat ? (isConnected ? 'CHAT ACTIVE' : 'REALTIME CONNECTING') : 'NO CHAT FOUND'}
            </span>
            <span style={{
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '8px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(6, 78, 59, 0.18)',
              background: 'rgba(220, 252, 231, 0.75)',
              fontWeight: 700,
              fontSize: '12px',
              color: '#065f46',
            }}>
              {currentEmail || 'Profile'}
            </span>
          </div>
        </div>

        {hasChat && (
          <div style={{
            marginTop: '14px',
            padding: '12px 14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(145deg, rgba(134, 239, 172, 0.55), rgba(74, 222, 128, 0.38))',
            border: '1px solid rgba(22, 163, 74, 0.25)',
            boxShadow: '0 10px 25px rgba(20, 83, 45, 0.18)',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              background: 'linear-gradient(145deg, #22c55e, #16a34a)',
              color: '#ecfdf5',
              boxShadow: '0 6px 14px rgba(21, 128, 61, 0.35)',
            }}>
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#14532d' }}>{partnerName}</p>
            </div>
          </div>
        )}

        {!hasChat && (
          <div style={{
            marginTop: '18px',
            padding: '16px',
            borderRadius: '14px',
            border: '1px dashed rgba(22, 163, 74, 0.4)',
            background: 'linear-gradient(135deg, rgba(187, 247, 208, 0.45), rgba(220, 252, 231, 0.5))',
            textAlign: 'center',
            color: '#166534',
          }}>
            No chat entity found for this user yet.
          </div>
        )}

          <div ref={messagesRef} className="chat-scroll-hidden" style={listStyle}>
            {messages.length === 0 && <div style={{ color: '#166534' }}>No messages yet.</div>}
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
                      border: isSelf ? '1px solid rgba(22, 163, 74, 0.28)' : '1px solid rgba(15, 23, 42, 0.12)',
                      background: isSelf
                        ? 'linear-gradient(145deg, #86efac, #4ade80)'
                        : 'linear-gradient(145deg, #ffffff, #dcfce7)',
                      color: '#0f172a',
                      boxShadow: isSelf
                        ? '0 10px 20px rgba(21, 128, 61, 0.25)'
                        : '0 8px 16px rgba(15, 23, 42, 0.1)',
                      animation: 'messageFade 0.35s ease',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {typeof msg === 'string' ? msg : msg.content || JSON.stringify(msg)}
                    {msg.self && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#166534', textAlign: 'right', letterSpacing: '0.5px' }}>
                        {msg.status === 'SEEN' ? '✓✓' : '✓'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {typingNotice && <p style={{ marginTop: '8px', color: '#15803d' }}>{typingNotice}</p>}

        <form
          onSubmit={async (event) => {
            event.preventDefault()
            if (!partnerEmail || !content.trim() || !currentEmail) {
              return
            }
            const trimmedContent = content.trim()
            const localId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`

            try {
              const response = await fetch('http://localhost:8080/messages/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ receiverEmail: partnerEmail, content: trimmedContent }),
              })

              const data = await response.json().catch(() => null)
              if (!response.ok) {
                alert(data?.message || 'Failed to send message')
                return
              }

              const saved = normalizeMessage(data?.data)
              if (saved) {
                setMessages((prev) => [...prev, saved])
              } else {
                setMessages((prev) => [...prev, {
                  id: localId,
                  senderEmail: currentEmail,
                  receiverEmail: partnerEmail,
                  content: trimmedContent,
                  self: true,
                  status: 'SENT',
                }])
              }
              setContent('')
            } catch {
              alert('Failed to send message')
            }
          }}
          style={{
            marginTop: '14px',
            display: 'grid',
            gap: '10px',
            opacity: 1,
            pointerEvents: 'auto',
          }}
        >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
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
                  flex: 1,
                  minHeight: '62px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  background: 'rgba(240, 253, 244, 0.92)',
                  color: '#14532d',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(145deg, #22c55e, #16a34a)',
                  color: '#ecfdf5',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 12px 24px rgba(22, 101, 52, 0.3)',
                  opacity: hasChat ? 1 : 0.6,
                  height: '46px',
                }}
                disabled={!hasChat || !partnerEmail}
              >
                Send
              </button>
            </div>
        </form>
      </div>
    </div>
  )
}