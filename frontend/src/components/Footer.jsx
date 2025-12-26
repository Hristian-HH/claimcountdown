import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle py-12 bg-surface">
      <div className="container-app">
        <div className="text-center text-sm text-text-muted space-x-4">
          <span>© 2025 ClaimCountdown</span>
          <span>·</span>
          <Link to="#" className="hover:text-text-primary transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link to="#" className="hover:text-text-primary transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
