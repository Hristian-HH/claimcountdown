import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Landing() {
  const features = [
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Smart Detection',
      description: 'Automatically identifies Lost, Damaged, and Misplaced inventory claims from your FBA reports.'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Deadline Tracking',
      description: 'Never miss the 60-day window. Automatic countdown tracking for every claim.'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Alerts',
      description: 'Weekly digest of expiring claims with total value at risk highlighted.'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Urgency Dashboard',
      description: 'Color-coded priority view puts the most urgent claims at your fingertips.'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      title: 'Bulk Actions',
      description: 'Update status for multiple claims at once. Save time with batch operations.'
    },
    {
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Export Ready',
      description: 'Download your claims as CSV anytime. Filter by status or urgency.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border-subtle">
        <div className="container-app">
          <div className="flex justify-between items-center h-[72px]">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold text-text-primary">ClaimCountdown</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)'}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-32">
        <div className="container-app">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 mb-8">
              For Amazon FBA Sellers
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight text-text-primary mb-6">
              Never Lose Reimbursement Money to{' '}
              <span className="text-gradient">Deadlines</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Track your FBA claims, get alerts before the 60-day window expires. Stop leaving money on the table.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn btn-primary px-8 py-3.5 text-base shadow-elevated group"
              >
                Start Free
                <svg className="inline-block w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#features"
                className="btn btn-secondary px-8 py-3.5 text-base"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white rounded-2xl shadow-modal border border-border-subtle p-8 transform rotate-1">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-400">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-gray-50/50">
        <div className="container-app">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Simple tools to protect your Amazon reimbursements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-border-subtle hover:shadow-card transition-all duration-200 group"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mb-5 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section bg-white">
        <div className="container-app">
          <div className="text-center">
            <p className="text-sm font-medium text-text-muted tracking-wide uppercase mb-8">
              Trusted by Amazon FBA Sellers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-40">
              {/* Placeholder logos */}
              <div className="h-12 w-32 bg-gray-200 rounded"></div>
              <div className="h-12 w-32 bg-gray-200 rounded"></div>
              <div className="h-12 w-32 bg-gray-200 rounded"></div>
              <div className="h-12 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-text-primary mb-4">
              Ready to stop losing money?
            </h2>
            <p className="text-lg text-text-secondary mb-10">
              Start tracking your claims in 2 minutes
            </p>
            <Link
              to="/register"
              className="btn btn-primary px-8 py-3.5 text-base shadow-elevated inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
