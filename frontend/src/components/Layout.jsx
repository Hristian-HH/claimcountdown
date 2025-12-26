import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  )
}
