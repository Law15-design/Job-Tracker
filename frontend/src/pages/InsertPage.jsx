import { useState } from 'react'

// backend url, if i host this online later i just change this one line
const API_BASE = 'https://job-tracker-lzz9.onrender.com/api'

function InsertPage({ goHome, appPassword }) {
  // one state for each input box, react call this "controlled input"
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobId, setJobId] = useState('')
  const [useToday, setUseToday] = useState(true)
  const [customDate, setCustomDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // stop page from doing normal refresh on form submit
    setError('')
    setSuccessMsg('')

    // basic check before even calling backend, save a request if empty
    if (!jobTitle.trim() || !company.trim()) {
      setError('Job title and company are required.')
      return
    }

    setSubmitting(true)

    try {
      // sending to my java backend, also attaching password header
      // since i added login protection on backend now
      const response = await fetch(`${API_BASE}/jobs/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-App-Password': appPassword },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          company: company.trim(),
          jobId: jobId.trim(),
          useToday: useToday,
          appliedDate: customDate
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Something went wrong.')
      }

      // clear form so its ready for next job i add
      setJobTitle('')
      setCompany('')
      setJobId('')
      setUseToday(true)
      setCustomDate('')
      setSuccessMsg('Job application added!')
    } catch (err) {
      setError(err.message)
    } finally {
      // this run no matter success or fail, so button dont stay stuck on "saving"
      setSubmitting(false)
    }
  }

  return (
    <div className="page-fade">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="status-badge status-Accepted" style={{ marginBottom: 16, display: 'block', padding: 12 }}>{successMsg}</div>}

        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            placeholder="e.g. Data Analyst Intern"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Job ID (optional)</label>
          <input
            type="text"
            placeholder="e.g. R12345"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Applied Date</label>
          <div className="date-toggle">
            <button
              type="button"
              className={useToday ? 'active' : ''}
              onClick={() => setUseToday(true)}
            >
              Today
            </button>
            <button
              type="button"
              className={!useToday ? 'active' : ''}
              onClick={() => setUseToday(false)}
            >
              Other Date
            </button>
          </div>

          {/* only show date picker if they pick "other date" option */}
          {!useToday && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
            />
          )}
        </div>

        <button type="submit" className="btn btn-insert" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Application'}
        </button>
      </form>

      <button className="btn btn-back" onClick={goHome}>
        Back to Home
      </button>
    </div>
  )
}

export default InsertPage