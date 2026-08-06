import { useState, useEffect } from 'react'

const API_BASE = 'https://job-tracker-lzz9.onrender.com/api'

const FILTERS = ['All', 'Applied', 'Interview', 'Accepted', 'Rejected']

// calculate how many days ago the applied date was, in plain words
function daysAgoText(dateStr) {
  // splitting string myself instead of new Date(string) because that one
  // assume UTC timezone and give me wrong day sometime
  const [year, month, day] = dateStr.split('-').map(Number)
  const appliedDate = new Date(year, month - 1, day) // month start from 0 in js, weird but ok

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today - appliedDate
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1) return `${diffDays} days ago`
  return dateStr // just in case something weird happen
}

function ViewPage({ goHome, appPassword }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [actionJob, setActionJob] = useState(null) // job i tapped, open the bottom sheet

  // empty [] mean this only run once when page first load
  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/jobs/all`, {
        headers: { 'X-App-Password': appPassword }
      })
      const data = await response.json()
      setJobs(data)
    } catch (err) {
      setError('Could not load jobs from server.')
    } finally {
      setLoading(false)
    }
  }

  // called from bottom sheet when i pick a status
  async function handleStatusChange(newStatus) {
    if (!actionJob) return
    try {
      const response = await fetch(`${API_BASE}/jobs/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Password': appPassword },
        body: JSON.stringify({ id: actionJob.id, status: newStatus })
      })
      const data = await response.json()

      if (data.success) {
        // update the list in place instead of calling loadJobs again
        setJobs(jobs.map(j => j.id === actionJob.id ? { ...j, status: newStatus } : j))
        setActionJob(null)
      } else {
        setError('Update failed.')
      }
    } catch (err) {
      setError('Could not reach the server.')
    }
  }

  // called from bottom sheet delete button
  async function handleDelete() {
    if (!actionJob) return
    const confirmed = window.confirm(`Delete "${actionJob.jobTitle}" at ${actionJob.company}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE}/jobs/delete?id=${actionJob.id}`, {
        method: 'POST',
        headers: { 'X-App-Password': appPassword }
      })
      const data = await response.json()

      if (data.success) {
        setJobs(jobs.filter(j => j.id !== actionJob.id))
        setActionJob(null)
      } else {
        setError('Delete failed.')
      }
    } catch (err) {
      setError('Could not reach the server.')
    }
  }

  // filter the jobs based on which tab active, this all happen in browser
  // dont need new server call every time i switch tab
  const visibleJobs = activeFilter === 'All'
    ? jobs
    : jobs.filter(job => job.status === activeFilter)

  return (
    <div className="page-fade">
      <div className="filter-tabs">
        {FILTERS.map(filter => (
          <button
            key={filter}
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="empty-message">Loading...</div>}

      {!loading && visibleJobs.length === 0 && (
        <div className="empty-message">No applications here yet.</div>
      )}

      {/* tap anywhere on row now open the bottom sheet with options */}
      {!loading && visibleJobs.map(job => (
        <div
          key={job.id}
          className={`job-row status-row-${job.status}`}
          onClick={() => setActionJob(job)}
        >
          <div className="job-row-title">{job.jobTitle}</div>
          <div className="job-row-company">{job.company}</div>
          <div className="job-row-date">
            {job.jobId && `ID: ${job.jobId} · `}
            Applied {job.appliedDate} ({daysAgoText(job.appliedDate)})
            {' · '}
            <span className={`status-badge status-${job.status}`}>{job.status}</span>
          </div>
        </div>
      ))}

      <button className="btn btn-back" onClick={goHome}>
        Back to Home
      </button>

      {/* bottom sheet, only render when actionJob is set to something */}
      {actionJob && (
        <>
          <div className="sheet-overlay" onClick={() => setActionJob(null)} />
          <div className="action-sheet">
            <div className="sheet-handle" />
            <div className="sheet-title">{actionJob.jobTitle}</div>
            <div className="sheet-subtitle">{actionJob.company}</div>

            <div className="sheet-section-label">Update Status</div>
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

            <button className="btn btn-back" onClick={() => setActionJob(null)}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ViewPage