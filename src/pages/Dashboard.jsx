import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Receipt, 
  Settings 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Try to parse user data from localStorage to show their role
  let userProfile = { first_name: 'Usuario', role: 'invitado' };
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      userProfile = JSON.parse(rawUser);
    }
  } catch(e) {}

  const handleLogout = () => {
    // Clear all session tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect entirely out of the protected area
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar de Administracion */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(45, 55, 63, 0.1)' }}>
          <img src="/bear-logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>Hamutay</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Panel de Control</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', background: 'var(--color-bg)', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
            <LayoutDashboard size={20} /> Resumen
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Users size={20} /> Usuarios
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <BookOpen size={20} /> Cursos y Notas
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Receipt size={20} /> Facturación
          </a>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '8px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Settings size={20} /> Configuración
          </a>
        </nav>
        
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(45, 55, 63, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
             <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
               {userProfile.first_name.charAt(0)}
             </div>
             <div>
               <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>Hola, {userProfile.first_name}</p>
               <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Rol: {userProfile.role}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #F87171', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.2s' }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-text)', margin: 0 }}>Panel General</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Bienvenido al sistema de administración de Hamutay Schools.</p>
        </header>

        {/* Dashboard Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>Estudiantes Activos</p>
                   <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>1,432</h3>
                </div>
                <div style={{ background: 'rgba(105, 151, 126, 0.1)', padding: '0.6rem', borderRadius: '8px', color: 'var(--color-tertiary)' }}>
                   <Users size={24} />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--color-tertiary)', margin: 0, fontWeight: '500' }}>+12% este mes</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>Facturas Pendientes</p>
                   <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>45</h3>
                </div>
                <div style={{ background: 'rgba(211, 73, 55, 0.1)', padding: '0.6rem', borderRadius: '8px', color: 'var(--color-primary)' }}>
                   <Receipt size={24} />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', margin: 0, fontWeight: '500' }}>Requiere atención urgente</p>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', margin: 0, boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>Cursos Registrados</p>
                   <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>84</h3>
                </div>
                <div style={{ background: 'rgba(224, 159, 57, 0.1)', padding: '0.6rem', borderRadius: '8px', color: 'var(--color-secondary)' }}>
                   <BookOpen size={24} />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Operando correctamente</p>
          </div>

        </div>

        {/* Dashboard empty area */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          <p>Selecciona un módulo en la barra lateral para ver su detalle.</p>
        </div>

      </main>
    </div>
  );
}
