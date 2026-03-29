import React from 'react';
import { 
  BookOpen, 
  Receipt, 
  MessageSquare, 
  Users, 
  ChevronRight, 
  Leaf, 
  Shield 
} from 'lucide-react';

function App() {
  return (
    <>
      {/* Decorative Background */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="glow-blob blob-3"></div>

      {/* Header */}
      <header className="header glass">
        <div className="container header-content">
          <a href="/" className="logo">
            <img src="/bear-logo.png" alt="Hamutay Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} /> Hamutay <span>Schools</span>
          </a>
          <nav>
            <a href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }}>
              Iniciar Sesión
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="text-gradient">Transforma la gestión de tu colegio</h1>
            <p>
              Plataforma integral con tecnología moderna y sólidas raíces andinas. Centraliza notas, facturación y comunicación en un solo lugar.
            </p>
            <div className="hero-actions">
              <a href="#empieza" className="btn btn-primary">
                Empieza Gratis <ChevronRight size={18} />
              </a>
              <a href="#planes" className="btn btn-secondary">
                Ver Planes
              </a>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glass-card hero-image-placeholder">
              <div style={{ textAlign: 'center', opacity: 0.8 }}>
                <Shield size={64} style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }} />
                <h3>Plataforma Segura</h3>
                <p>Dashboard de Administración</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container" id="features">
        <div className="section-header glass-card" style={{ border: 'none', background: 'transparent', padding: '0' }}>
          <h2>Módulos Completos</h2>
          <p>Todo lo que tu institución educativa necesita para crecer, organizado y listo para usar.</p>
        </div>
        
        <div className="features-grid">
          <div className="glass-card">
            <div className="feature-icon-wrapper">
              <BookOpen size={28} />
            </div>
            <h3>Gestión Académica</h3>
            <p>Control total sobre notas, asistencia, horarios y seguimiento personalizado de los estudiantes.</p>
          </div>
          
          <div className="glass-card">
            <div className="feature-icon-wrapper" style={{ color: 'var(--color-secondary)', background: 'rgba(227, 180, 72, 0.1)' }}>
              <Receipt size={28} />
            </div>
            <h3>Facturación Integrada</h3>
            <p>Automatiza los cobros, mensualidades e integra pasarelas de pago para facilitar la gestión comercial.</p>
          </div>
          
          <div className="glass-card">
            <div className="feature-icon-wrapper" style={{ color: 'var(--color-tertiary)', background: 'rgba(82, 142, 115, 0.1)' }}>
              <MessageSquare size={28} />
            </div>
            <h3>Comunicación Eficiente</h3>
            <p>Notificaciones y comunicados para mantener a los padres y profesores siempre conectados.</p>
          </div>
          
          <div className="glass-card">
            <div className="feature-icon-wrapper" style={{ color: 'var(--color-bg)', background: 'var(--color-text)' }}>
              <Users size={28} />
            </div>
            <h3>Multi-Roles</h3>
            <p>Accesos personalizados para Directores, Docentes, Estudiantes y Soporte.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo" style={{ fontSize: '1.2rem' }}>
              <img src="/bear-logo.png" alt="Hamutay Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} /> Hamutay <span>Schools</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Plataforma</a>
              <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Soporte</a>
              <a href="#" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Políticas</a>
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

export default App;
