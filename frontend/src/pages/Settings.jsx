import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Layout from '../components/Layout'

export default function Settings() {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/settings/preferences')
      setPreferences(response.data)
    } catch (error) {
      console.error('Error fetching preferences:', error)
      setMessage({ type: 'error', text: 'Failed to load preferences' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await axios.put('/api/settings/preferences', preferences)
      setMessage({ type: 'success', text: 'Preferences saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setSendingTest(true)
    setMessage(null)

    try {
      const response = await axios.post('/api/settings/test-email')
      setMessage({
        type: 'success',
        text: `Test email sent to ${response.data.email}! Check your inbox.`
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to send test email'
      })
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-72px)] bg-app-bg">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-72px)] bg-app-bg">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-border-subtle">
          <div className="container-app py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-text-primary">Settings</h1>
                <p className="text-sm text-text-secondary mt-1.5">Manage your account preferences and notifications</p>
              </div>
              <Link
                to="/dashboard"
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-app py-8">
          <div className="max-w-3xl">
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Email Preferences */}
            <div className="card mb-6 animate-in-delay-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary">Email Preferences</h2>
                  <p className="text-sm text-text-secondary mt-1">Configure your email notification settings</p>
                </div>
              </div>

              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  {/* Email Alerts Toggle */}
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-border-subtle">
                    <div className="flex items-center h-6">
                      <button
                        type="button"
                        onClick={() =>
                          setPreferences({
                            ...preferences,
                            email_alerts_enabled: preferences.email_alerts_enabled === 1 ? 0 : 1
                          })
                        }
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                          preferences?.email_alerts_enabled === 1
                            ? 'bg-gradient-to-r from-accent to-purple-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            preferences?.email_alerts_enabled === 1 ? 'translate-x-8' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-text-primary cursor-pointer">
                        Receive email alerts
                      </label>
                      <p className="text-sm text-text-secondary mt-1">
                        Get notified when claims are expiring soon
                      </p>
                    </div>
                  </div>

                  {/* Alert Frequency */}
                  <div>
                    <label
                      htmlFor="alert-frequency"
                      className="block text-sm font-semibold text-text-primary mb-3"
                    >
                      Alert Frequency
                    </label>
                    <select
                      id="alert-frequency"
                      value={preferences?.alert_frequency || 'weekly'}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          alert_frequency: e.target.value
                        })
                      }
                      disabled={preferences?.email_alerts_enabled !== 1}
                      className="input disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="weekly">Weekly (every Monday)</option>
                      <option value="daily">Daily</option>
                    </select>
                    <p className="mt-3 text-xs text-text-muted">
                      {preferences?.alert_frequency === 'daily'
                        ? 'You will receive alerts every day if you have claims expiring within 7 days'
                        : 'You will receive alerts every Monday morning if you have claims expiring within 7 days'}
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Test Email */}
            <div className="card mb-6 animate-in-delay-2">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary">Test Email</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Send a test email to verify your email alerts are working correctly
                  </p>
                </div>
              </div>
              <button
                onClick={handleTestEmail}
                disabled={sendingTest || preferences?.email_alerts_enabled !== 1}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {sendingTest ? 'Sending...' : 'Send Test Email'}
              </button>
              {preferences?.email_alerts_enabled !== 1 && (
                <p className="mt-3 text-xs text-text-muted">
                  Enable email alerts to send a test email
                </p>
              )}
            </div>

            {/* Account Info */}
            <div className="card animate-in-delay-3">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary">Account Information</h2>
                  <p className="text-sm text-text-secondary mt-1">Your profile details</p>
                </div>
              </div>
              <dl className="space-y-4">
                <div className="flex items-start justify-between py-3 border-b border-border-subtle">
                  <div>
                    <dt className="text-sm font-medium text-text-muted mb-1">Email</dt>
                    <dd className="text-sm font-semibold text-text-primary">{JSON.parse(localStorage.getItem('user') || '{}').email}</dd>
                  </div>
                </div>
                <div className="flex items-start justify-between py-3 border-b border-border-subtle">
                  <div>
                    <dt className="text-sm font-medium text-text-muted mb-1">Organization</dt>
                    <dd className="text-sm font-semibold text-text-primary">{JSON.parse(localStorage.getItem('user') || '{}').organizationName}</dd>
                  </div>
                </div>
                <div className="flex items-start justify-between py-3">
                  <div>
                    <dt className="text-sm font-medium text-text-muted mb-1">Role</dt>
                    <dd className="text-sm font-semibold text-text-primary capitalize">{JSON.parse(localStorage.getItem('user') || '{}').role}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
