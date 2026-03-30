import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Menu, Loader2, Building2, User, Shield, 
  BookOpen, GraduationCap, CalendarDays, ClipboardList, 
  MessageSquare, Settings, Home, Bell, Users
} from 'lucide-react';
import StorageImage from '../components/StorageImage';
import ModuleSchoolUsers from './modules/ModuleSchoolUsers';

export default function SchoolPortal() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('home');
  const [meData, setMeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse stored user from login response
  let userProfile = { first_name: 'Usuario', role: 'colaborador' };
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) userProfile = JSON.parse(rawUser);
  } catch(e) {}

  useEffect(() => { fetchMe(); }, []);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/schools/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Sesión expirada o inválida');
      setMeData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginType');
    navigate('/login');
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)', gap: '1rem' }}>
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem 2rem', borderRadius: '8px' }}>{error}</div>
        <button onClick={handleLogout} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Volver al Login
        </button>
      </div>
    );
  }

  const displayName = meData?.first_name || userProfile.first_name || 'Usuario';
  const displayRole = userProfile.role || 'Colaborador';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ─── Global Header ─── */}
      <header style={{ height: '70px', background: 'white', borderBottom: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)', transition: 'background 0.2s' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/bear-logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-text)', fontWeight: '700', lineHeight: 1.2 }}>Hamutay</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Portal Escolar</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} title="Notificaciones">
            <Bell size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
              {meData?.avatar_path ? (
                <StorageImage fileKey={meData.avatar_path} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{displayName} {meData?.last_name || ''}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{displayRole}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(211, 73, 55, 0.1)', border: 'none', color: '#B91C1C', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ─── Sidebar ─── */}
        <aside style={{ width: isCollapsed ? '75px' : '260px', background: 'white', borderRight: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)', overflow: 'hidden', zIndex: 5 }}>
          <nav style={{ flex: 1, padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <SidebarItem id="home" icon={Home} label="Inicio" />  
            <SidebarItem id="profile" icon={User} label="Mi Perfil" />

            <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: isCollapsed ? '0' : '1rem', textAlign: isCollapsed ? 'center' : 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCollapsed ? '—' : 'Académico'}
            </div>
            <SidebarItem id="courses" icon={BookOpen} label="Mis Cursos" />
            <SidebarItem id="grades" icon={GraduationCap} label="Calificaciones" />
            <SidebarItem id="schedule" icon={CalendarDays} label="Horarios" />
            <SidebarItem id="attendance" icon={ClipboardList} label="Asistencia" />

            <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: isCollapsed ? '0' : '1rem', textAlign: isCollapsed ? 'center' : 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCollapsed ? '—' : 'Comunicación'}
            </div>
            <SidebarItem id="messages" icon={MessageSquare} label="Mensajes" />

            <div style={{ marginTop: '1.2rem', marginBottom: '0.3rem', paddingLeft: isCollapsed ? '0' : '1rem', textAlign: isCollapsed ? 'center' : 'left', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isCollapsed ? '—' : 'Administración'}
            </div>
            <SidebarItem id="school-users" icon={Users} label="Usuarios del Colegio" />
          </nav>
        </aside>

        {/* ─── Main Content ─── */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', background: 'var(--color-bg)' }}>
          
          {activeModule === 'home' && (
            <>
              {/* Welcome Banner */}
              <div style={{ background: 'linear-gradient(135deg, rgba(211, 73, 55, 0.08), rgba(224, 159, 57, 0.08))', borderRadius: '20px', padding: '2.5rem', marginBottom: '2rem', border: '1px solid rgba(45, 55, 63, 0.05)' }}>
                <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>
                  ¡Bienvenido, {displayName}! 👋
                </h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '1.05rem' }}>
                  Estás conectado al portal escolar. Tu rol es <strong style={{ color: 'var(--color-secondary)', textTransform: 'capitalize' }}>{displayRole}</strong>.
                </p>
              </div>

              {/* Dashboard Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Mis Cursos', icon: BookOpen, color: 'var(--color-tertiary)', bg: 'rgba(105, 151, 126, 0.1)' },
                  { label: 'Mensajes', icon: MessageSquare, color: 'var(--color-secondary)', bg: 'rgba(224, 159, 57, 0.1)' },
                  { label: 'Asistencia', icon: ClipboardList, color: 'var(--color-primary)', bg: 'rgba(211, 73, 55, 0.08)' },
                ].map(card => (
                  <div key={card.label} style={{ background: 'white', padding: '1.8rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.08)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 0.3rem' }}>{card.label}</p>
                        <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>—</h3>
                      </div>
                      <div style={{ background: card.bg, padding: '0.6rem', borderRadius: '8px', color: card.color }}>
                        <card.icon size={22} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Módulo próximamente</p>
                  </div>
                ))}
              </div>

              {/* Profile Quick View */}
              {meData && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(45, 55, 63, 0.08)' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.5rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={18} color="var(--color-secondary)" /> Datos de tu Cuenta
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
                    {[
                      { k: 'Nombre Completo', v: `${meData.first_name} ${meData.last_name}` },
                      { k: 'Correo', v: meData.email },
                      { k: 'Documento', v: `${meData.id_type} ${meData.id_number}` },
                      { k: 'Teléfono', v: meData.phone || 'No registrado' },
                      { k: 'Dirección', v: meData.address || 'No registrada' },
                      { k: 'Contacto Emergencia', v: meData.emergency_contact_name || 'No registrado' },
                    ].map(item => (
                      <div key={item.k}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>{item.k}</span>
                        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeModule === 'profile' && meData && (
            <div>
              <h1 style={{ fontSize: '2rem', margin: '0 0 2rem', color: 'var(--color-text)' }}>Mi Perfil</h1>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Profile Card */}
                <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '2.5rem', border: '1px solid rgba(45, 55, 63, 0.08)', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(45, 55, 63, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '3px solid rgba(0,0,0,0.05)' }}>
                    {meData.avatar_path ? (
                      <StorageImage fileKey={meData.avatar_path} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <User size={50} color="var(--color-text-muted)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.3rem', color: 'var(--color-text)' }}>{meData.first_name} {meData.last_name}</h2>
                    <span style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{displayRole}</span>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                      {[
                        { k: 'Correo Electrónico', v: meData.email },
                        { k: 'Documento', v: `${meData.id_type} ${meData.id_number}` },
                        { k: 'Teléfono', v: meData.phone || 'No registrado' },
                        { k: 'Fecha de Nacimiento', v: meData.birth_date ? new Date(meData.birth_date).toLocaleDateString() : 'No registrada' },
                      ].map(item => (
                        <div key={item.k}>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>{item.k}</span>
                          <span style={{ color: 'var(--color-text)' }}>{item.v}</span>
                        </div>
                      ))}
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>Dirección</span>
                        <span style={{ color: 'var(--color-text)' }}>{meData.address || 'No registrada'}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.3rem' }}>Contacto de Emergencia</span>
                        <span style={{ color: 'var(--color-text)' }}>{meData.emergency_contact_name || 'No registrado'} {meData.emergency_contact_phone ? `(${meData.emergency_contact_phone})` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Integrated QR Code */}
                  {meData.qr_code && (
                    <div style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', padding: '1.2rem', background: 'rgba(45, 55, 63, 0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código QR</span>
                      <div style={{ background: 'white', padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.1)' }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(meData.qr_code)}&color=2D373F&bgcolor=FFFFFF&margin=4`}
                          alt="QR Code"
                          style={{ width: '100px', height: '100px', display: 'block' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>
                        {meData.qr_code.substring(0, 15)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeModule === 'school-users' && meData && (
            <ModuleSchoolUsers schoolId={meData.school_id} />
          )}

          {/* Placeholder for future modules */}
          {['courses', 'grades', 'schedule', 'attendance', 'messages'].includes(activeModule) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
              <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(45, 55, 63, 0.08)', maxWidth: '400px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(224, 159, 57, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Settings size={36} color="var(--color-secondary)" />
                </div>
                <h2 style={{ color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Próximamente</h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  Este módulo se encuentra en desarrollo. ¡Pronto estará disponible!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
