import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Receipt, 
  Settings,
  Building2,
  ShieldCheck,
  Menu
} from 'lucide-react';
import PlatformTable from '../components/PlatformTable';
import ModuleUsers from './modules/ModuleUsers';
import ModuleSchools from './modules/ModuleSchools';
import ModuleSchoolRoles from './modules/ModuleSchoolRoles';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('overview'); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Try to parse user data from localStorage
  let userProfile = { first_name: 'Usuario', role: 'invitado' };
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      userProfile = JSON.parse(rawUser);
    }
  } catch(e) {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveModule(id)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', border: 'none',
        borderRadius: '8px', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', width: '100%',
        background: activeModule === id ? 'var(--color-bg)' : 'transparent', 
        color: activeModule === id ? 'var(--color-primary)' : 'var(--color-text-muted)', 
        fontWeight: activeModule === id ? '600' : '400',
        justifyContent: isCollapsed ? 'center' : 'flex-start'
      }}
      title={isCollapsed ? label : ''}
    >
      <Icon size={20} style={{ flexShrink: 0 }} />
      {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Global Navbar (Top Header) */}
      <header style={{ height: '70px', background: 'white', borderBottom: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)', transition: 'background 0.2s' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/bear-logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text)', fontWeight: '700' }}>Hamutay</h3>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
               {(userProfile.first_name || userProfile.name || 'U').charAt(0).toUpperCase()}
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{userProfile.first_name || userProfile.name || 'Usuario'}</span>
               <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{userProfile.role || 'Super Admin'}</span>
             </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(211, 73, 55, 0.1)', border: 'none', color: '#B91C1C', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Layout Body Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar de Administracion Collapsable */}
        <aside style={{ width: isCollapsed ? '75px' : '260px', background: 'white', borderRight: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)', overflow: 'hidden', zIndex: 5 }}>
          <nav style={{ flex: 1, padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <SidebarItem id="overview" icon={LayoutDashboard} label="Resumen" />
            <SidebarItem id="users" icon={Users} label="Usuarios Admin" />
            
            <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: isCollapsed ? '0' : '1rem', textAlign: isCollapsed ? 'center' : 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              {isCollapsed ? '---' : 'Colegios'}
            </div>
            <SidebarItem id="schools" icon={BookOpen} label="Habilitar Colegios" />
            <SidebarItem id="school-roles" icon={ShieldCheck} label="Roles y Accesos" />
            
            <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: isCollapsed ? '0' : '1rem', textAlign: isCollapsed ? 'center' : 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              {isCollapsed ? '---' : 'Operaciones'}
            </div>
            <SidebarItem id="plans" icon={Settings} label="Planes Comerciales" />
            <SidebarItem id="invoices" icon={Receipt} label="Facturación" />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', background: 'var(--color-bg)' }}>
          <header style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-text)', margin: 0 }}>
              {activeModule === 'overview' && 'Panel General'}
              {activeModule === 'users' && 'Gestión de Usuarios'}
              {activeModule === 'schools' && 'Infraestructura de Colegios'}
              {activeModule === 'school-roles' && 'Gestión de Roles y Permisos'}
              {activeModule === 'plans' && 'Portafolio de Planes'}
              {activeModule === 'invoices' && 'Cobranza y Facturación'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Bienvenido al sistema de administración de Hamutay Schools.
            </p>
          </header>

          {activeModule === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Overview Widgets */}
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
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)' }}>
                 {/* Simulating stats */}
                 <p style={{color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '1rem'}}>
                   Ve al panel de colegios o facturas para visualizar métricas en vivo.
                 </p>
              </div>
            </div>
          )}

          {/* Dynamic Data Modules mapping directly to endpoints documented in platform_api.md */}
          {activeModule === 'users' && (
            <ModuleUsers />
          )}
          
          {activeModule === 'schools' && (
            <ModuleSchools />
          )}

          {activeModule === 'school-roles' && (
            <ModuleSchoolRoles />
          )}

          {activeModule === 'plans' && (
            <PlatformTable 
              title="Catálogo de Planes" 
              description="Planes de suscripción y límites de estudiantes configurados." 
              endpoint="plans" 
              columns={[
                { header: 'Plan', accessor: r => r.name },
                { header: 'Código', accessor: r => r.code },
                { header: 'Estudiantes Max', accessor: r => r.max_students },
                { header: 'Mensaje/Detalle', accessor: r => r.description },
                { header: 'Precio ($)', accessor: r => r.monthly_price }
              ]} 
            />
          )}

          {activeModule === 'invoices' && (
            <PlatformTable 
              title="Facturación del Sistema" 
              description="Historial de facturas y cobranzas a los colegios." 
              endpoint="invoices" 
              columns={[
                { header: '# Factura', accessor: r => r.invoice_number },
                { header: 'Monto Total', accessor: r => `$${r.total_amount} ${r.currency || 'USD'}` },
                { header: 'Método', accessor: r => r.payment_method || '-' },
                { header: 'Estado', accessor: r => r.status?.toUpperCase() || 'DESCONOCIDO' },
                { header: 'Descripción', accessor: r => r.description }
              ]} 
            />
          )}

        </main>
      </div>
    </div>
  );
}
