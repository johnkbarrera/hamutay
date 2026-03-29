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
  ShieldCheck
} from 'lucide-react';
import PlatformTable from '../components/PlatformTable';
import ModuleUsers from './modules/ModuleUsers';
import ModuleSchools from './modules/ModuleSchools';
import ModuleSchoolRoles from './modules/ModuleSchoolRoles';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('overview'); // state to control view
  
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
        display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', border: 'none',
        borderRadius: '8px', cursor: 'pointer', outline: 'none', transition: 'all 0.2s', width: '100%',
        background: activeModule === id ? 'var(--color-bg)' : 'transparent', 
        color: activeModule === id ? 'var(--color-primary)' : 'var(--color-text-muted)', 
        fontWeight: activeModule === id ? '600' : '400',
      }}
    >
      <Icon size={20} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar de Administracion */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(45, 55, 63, 0.1)' }}>
          <img src="/bear-logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>Hamutay</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Panel de Control</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <SidebarItem id="overview" icon={LayoutDashboard} label="Resumen" />
          <SidebarItem id="users" icon={Users} label="Usuarios Admin" />
          
          <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: '1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Colegios
          </div>
          <SidebarItem id="schools" icon={BookOpen} label="Colegios Registrados" />
          <SidebarItem id="school-roles" icon={ShieldCheck} label="Roles y Accesos" />
          
          <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: '1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operaciones y Negocio
          </div>
          <SidebarItem id="plans" icon={Settings} label="Planes Comerciales" />
          <SidebarItem id="invoices" icon={Receipt} label="Facturación" />
        </nav>
        
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid rgba(45, 55, 63, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
             <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
               {(userProfile.first_name || userProfile.name || 'U').charAt(0).toUpperCase()}
             </div>
             <div>
               <p style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0, color: 'var(--color-text)' }}>Hola, {userProfile.first_name || userProfile.name || 'Usuario'}</p>
               <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Rol: {userProfile.role || 'Super Admin'}</p>
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

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', width: 'calc(100% - 260px)' }}>
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
  );
}
