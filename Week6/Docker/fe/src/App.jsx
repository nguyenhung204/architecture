import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const apiEndpoint = useMemo(() => {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
    return `${baseUrl}/`
  }, [])

  const fetchMessage = async () => {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch(apiEndpoint)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const text = await response.text()
      setMessage(text)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    void fetchMessage()
  }, [apiEndpoint])

  return (
    <main className="app">
      <h1>FE call API từ BE</h1>
      <p className="muted">Endpoint: {apiEndpoint}</p>

      <div className="panel">
        <h2>Response</h2>
        {status === 'error' ? (
          <p className="error">{error}</p>
        ) : (
          <p className="message">{message}</p>
        )}

        <button
          type="button"
          onClick={() => void fetchMessage()}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Loading...' : 'Fetch Again'}
        </button>
      </div>

      <p className="hint">
        Đổi URL BE bằng biến build: <code>VITE_API_BASE_URL</code>
      </p>
    </main>
  )
}

export default App
