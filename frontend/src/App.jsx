import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import InsertPage from './pages/InsertPage'
import UpdatePage from './pages/UpdatePage'
import ViewPage from './pages/ViewPage'
import './App.css'

const API_BASE = 'https://job-tracker-lzz9.onrender.com/api'
// putting this on window so LoginPage.jsx can also reach it
// without me needing to import/pass it around everywhere
window.API_BASE = API_BASE

function App() {
  // which "page" we currently showing - home, insert, update, or view
  const [page, setPage] = useState('home')

  // storage usage info from neon, show on home screen
  const [dbInfo, setDbInfo] = useState(null)

  // check sessionStorage first - if i already logged in earlier this
  // browser session, dont make me type password again
  const [appPassword, setAppPassword] = useState(() => sessionStorage.getItem('appPassword'))

useEffect(() => {
    // refetch storage info anytime we land back on home page
    // (not just once at login) so the number stays accurate
    if (!appPassword || page !== 'home') return

    fetch(`${API_BASE}/jobs/dbsize`, {
      headers: { 'X-App-Password': appPassword }
    })
      .then(res => res.json())
      .then(data => setDbInfo(data))
      .catch(() => {})
  }, [appPassword, page])

  // if no password saved yet, show login screen and stop here
  // dont even render rest of the app
  if (!appPassword) {
    return (
      <div className="app">
        <LoginPage onSuccess={(pw) => setAppPassword(pw)} />
      </div>
    )
  }

  return (
    <div className="app">
      <h1 className="title">Job Application Tracker</h1>

      {page === 'home' && (
        <>
          <div className="home-buttons">
            <button className="btn btn-insert" onClick={() => setPage('insert')}>
              <span className="btn-icon">＋</span> Insert New Job
            </button>
            <button className="btn btn-update" onClick={() => setPage('update')}>
              <span className="btn-icon">↻</span> Update Status
            </button>
            <button className="btn btn-view" onClick={() => setPage('view')}>
              <span className="btn-icon">☰</span> View All
            </button>
          </div>

          {/* only show storage bar if we actually got data back ok */}
          {dbInfo && (
            <div className="storage-info">
              <div className="storage-info-text">
                {dbInfo.usedMb} MB of {dbInfo.limitMb} MB used
              </div>
              <div className="storage-bar-track">
                <div
                  className="storage-bar-fill"
                  style={{ width: `${Math.min(dbInfo.percentUsed, 100)}%` }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* passing appPassword down to every page so they can send it with their fetch calls */}
      {page === 'insert' && <InsertPage goHome={() => setPage('home')} appPassword={appPassword} />}
      {page === 'update' && <UpdatePage goHome={() => setPage('home')} appPassword={appPassword} />}
      {page === 'view' && <ViewPage goHome={() => setPage('home')} appPassword={appPassword} />}
    </div>
  )
}

export default App
