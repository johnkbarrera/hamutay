import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Layout para Rutas Públicas (agrega el Header y Footer)
function PublicLayout() {
  return (
    <>
      <header className="header glass">
        <div className="container header-content">
          <Link to="/" className="logo">
            <img src="/bear-logo.png" alt="Hamutay Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} /> Hamutay <span>Schools</span>
          </Link>
          <nav>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }}>
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo" style={{ fontSize: '1.2rem' }}>
              <img src="/bear-logo.png" alt="Hamutay Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} /> Hamutay <span>Schools</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Plataforma</Link>
              <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Soporte</Link>
              <Link to="/" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Políticas</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Hamutay API. Creado con raíces andinas y visión global.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Decorative Global Background (Opcional aislarlo tmb, pero queda bonito global) */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="glow-blob blob-3"></div>

      <Routes>
        {/* Rutas Públicas que usan el Layout (Header/Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rutas Privadas / Internas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
