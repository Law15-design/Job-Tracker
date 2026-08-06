import { useState } from 'react'

const API_BASE = 'http://localhost:8080/job-tracker/api'

function UpdatePage({ goHome, appPassword }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedJob, setSelectedJob] = useState(null) // job user tapped from the list
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  // run when user hit search button
  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setSelectedJob(null)

    if (!query.trim()) {
      setError('Type something to search first.')
      return
    }

    setSearching(true)
    try {
      // encodeURIComponent so spaces/special char in search dont break the url
      const response = await fetch(`${API_BASE}/jobs/search?query=${encodeURIComponent(query.trim())}`, {
        headers: { 'X-App-Password': appPassword }
      })
      const data = await response.json()
      setResults(data)
      if (data.length === 0) {
        setError('No jobs found matching that.')
      }
    } catch (err) {
      setError('Could not reach the server.')
    } finally {
      setSearching(false)
    }
  }

  // called when user tap status button like Interview/Accepted/Rejected
  async function handleStatusChange(newStatus) {
    if (!selectedJob) return
    setMsg('')
    setError('')

    try {
      const response = await fetch(`${API_BASE}/jobs/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Password': appPassword },
        body: JSON.stringify({ id: selectedJob.id, status: newStatus })
      })
      const data = await response.json()

      if (data.success) {
        setMsg(`Status updated to ${newStatus}!`)
        // updating local state too so screen show new status right away
        // dont need to refetch everything from server again
        setSelectedJob({ ...selectedJob, status: newStatus })
        setResults(results.map(job => job.id === selectedJob.id ? { ...job, status: newStatus } : job))
      } else {
        setError('Update failed.')
      }
    } catch (err) {
      setError('Could not reach the server.')
    }
  }

  // called when user tap delete then confirm the popup
  async function handleDelete() {
    if (!selectedJob) return

    const confirmed = window.confirm(`Delete "${selectedJob.jobTitle}" at ${selectedJob.company}? This cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE}/jobs/delete?id=${selectedJob.id}`, {
        method: 'POST',
        headers: { 'X-App-Password': appPassword }
      })
      const data = await response.json()

      if (data.success) {
        setResults(results.filter(job => job.id !== selectedJob.id))
        setSelectedJob(null)
        setMsg('Job deleted.')
      } else {
        setError('Delete failed.')
      }
    } catch (err) {
      setError('Could not reach the server.')
    }
  }

  return (
    <div className="page-fade">
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search by company, title, or job ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-update" style={{ marginTop: 10 }} disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {msg && <div className="status-badge status-Accepted" style={{ marginBottom: 16, display: 'block', padding: 12 }}>{msg}</div>}

      {/* show search result list only if nothing selected yet */}
      {!selectedJob && results.length > 0 && (
        <div className="search-results">
          {results.map(job => (
            <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
              <div className="job-card-title">{job.jobTitle}</div>
              <div className="job-card-company">{job.company}</div>
              <div className="job-card-meta">
                {job.jobId && `ID: ${job.jobId} · `}Applied {job.appliedDate}
                {' · '}
                <span className={`status-badge status-${job.status}`}>{job.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* once job selected, show the update/delete options instead of list */}
      {selectedJob && (
        <div>
          <div className="job-card selected">
            <div className="job-card-title">{selectedJob.jobTitle}</div>
            <div className="job-card-company">{selectedJob.company}</div>
            <div className="job-card-meta">
              Current status: <span className={`status-badge status-${selectedJob.status}`}>{selectedJob.status}</span>
            </div>
          </div>

          <div className="status-actions">
            <button className="status-btn interview" onClick={() => handleStatusChange('Interview')}>
              Interview
            </button>
            <button className="status-btn accepted" onClick={() => handleStatusChange('Accepted')}>
              Accepted
            </button>
            <button className="status-btn rejected" onClick={() => handleStatusChange('Rejected')}>
              Rejected
            </button>
          </div>

          <button className="delete-btn" onClick={handleDelete}>
            Delete This Application
          </button>

          <button className="btn btn-back" onClick={() => setSelectedJob(null)}>
            Back to Search Results
          </button>
        </div>
      )}

      <button className="btn btn-back" onClick={goHome}>
        Back to Home
      </button>
    </div>
  )
}

export default UpdatePage