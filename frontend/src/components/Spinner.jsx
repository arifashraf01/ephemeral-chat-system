import { useEffect } from 'react'

export default function Spinner({ size = 24, color = '#166534', text = 'Loading...', inline = false }) {
  useEffect(() => {
    if (!document.getElementById('spinner-keyframes')) {
      const styleTag = document.createElement('style')
      styleTag.id = 'spinner-keyframes'
      styleTag.innerHTML = `
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        .loading-spinner {
          border: 3px solid rgba(22, 163, 74, 0.2);
          border-left-color: var(--spinner-color, #166534);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      `
      document.head.appendChild(styleTag)
    }
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: inline ? 'row' : 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '8px', 
      padding: inline ? 0 : '16px' 
    }}>
      <div 
        className="loading-spinner"
        style={{ width: size, height: size, '--spinner-color': color }} 
      />
      {text && <div style={{ color, fontSize: '14px', fontWeight: 500 }}>{text}</div>}
    </div>
  )
}
