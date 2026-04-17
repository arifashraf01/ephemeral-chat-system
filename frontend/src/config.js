const defaultBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultBaseUrl).replace(/\/$/, '')

export const API_URLS = {
  authLogin: `${API_BASE_URL}/auth/login`,
  authSendOtp: `${API_BASE_URL}/auth/send-otp`,
  authVerifyOtp: `${API_BASE_URL}/auth/verify-otp`,
  requestsIncoming: `${API_BASE_URL}/requests/incoming`,
  requestsSent: `${API_BASE_URL}/requests/sent`,
  requestsSend: `${API_BASE_URL}/requests/send`,
  requestsAccept: (requestId) => `${API_BASE_URL}/requests/accept?requestId=${requestId}`,
  requestsReject: (requestId) => `${API_BASE_URL}/requests/reject?requestId=${requestId}`,
  chats: `${API_BASE_URL}/chats`,
  messagesSend: `${API_BASE_URL}/messages/send`,
  messagesConversation: (partnerEmail) => `${API_BASE_URL}/messages/conversation?partnerEmail=${encodeURIComponent(partnerEmail)}`,
  ws: `${API_BASE_URL}/ws`,
}

export { API_BASE_URL }
