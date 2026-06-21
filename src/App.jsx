import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <nav className="nav">
          <a href="/" className="logo">MyApp</a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div className="hero-content">
            <span className="badge">🚀 Welcome</span>
            <h1 className="hero-title">
              Build Something
              <span className="gradient-text"> Amazing</span>
            </h1>
            <p className="hero-description">
              A modern web application built with Vite + React.
              Fast, elegant, and ready for production.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setCount(c => c + 1)}>
                Count: {count}
              </button>
              <a href="#features" className="btn btn-secondary">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-glow" />
        </section>

        <section id="features" className="features">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Powered by Vite for instant hot module replacement and blazing fast builds.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚛️</div>
              <h3>React 19</h3>
              <p>Built with the latest React for modern, component-based architecture.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Modern Design</h3>
              <p>Clean, responsive UI with smooth animations and glassmorphism effects.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 MyApp. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
