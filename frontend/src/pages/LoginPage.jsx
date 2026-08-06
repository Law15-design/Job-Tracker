import { useState } from 'react'

function LoginPage({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // dont refresh page on submit

    setError('')
    setChecking(true)

    // i dont have separate "check password" endpoint on backend
    // so im just using jobs/all to test it - if password wrong,
    // my CorsFilter already send back 401 status, so i check for that
    try {
      const response = await fetch(`${window.API_BASE}/jobs/all`, {
        headers: { 'X-App-Password': password }
      })

      if (response.status === 401) {
        setError('Wrong password.')
        setChecking(false)
        return
      }

      // password correct if we get here
      // saving in sessionStorage so i dont have to login again every time
      // i switch page, but it clear when i close the tab (thats fine for me)
      sessionStorage.setItem('appPassword', password)
      onSuccess(password)
    } catch (err) {
      setError('Could not reach the server.')
      setChecking(false)
    }
  }

  return (
    <div className="page-fade login-wrapper">
      <div className="glass-panel login-box">
        <div className="login-icon">🔒</div>
        <h2 className="login-title">Job Tracker</h2>
        <p className="login-subtitle">Enter password to continue</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="password"
            className="search-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-insert" style={{ marginTop: 16 }} disabled={checking}>
            {checking ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage